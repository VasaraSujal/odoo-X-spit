import StockAdjustment from '../models/StockAdjustment.model.js';
import Product from '../models/Product.model.js';
import StockMovement from '../models/StockMovement.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// @desc    Get all stock adjustments
// @route   GET /api/adjustments
// @access  Protected
export const getStockAdjustments = catchAsync(async (req, res, next) => {
  const { status, warehouseId, adjustmentType, startDate, endDate, page = 1, limit = 50 } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (warehouseId) query.warehouseId = warehouseId;
  if (adjustmentType) query.adjustmentType = adjustmentType;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const adjustments = await StockAdjustment.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('processedBy', 'name email');

  const total = await StockAdjustment.countDocuments(query);

  res.status(200).json({
    success: true,
    count: adjustments.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: adjustments
  });
});

// @desc    Get single stock adjustment
// @route   GET /api/adjustments/:id
// @access  Protected
export const getStockAdjustment = catchAsync(async (req, res, next) => {
  const adjustment = await StockAdjustment.findById(req.params.id)
    .populate('processedBy', 'name email');

  if (!adjustment) {
    return next(new AppError('Stock adjustment not found', 404));
  }

  res.status(200).json({
    success: true,
    data: adjustment
  });
});

// @desc    Create new stock adjustment
// @route   POST /api/adjustments
// @access  Protected (Admin/Manager only)
export const createStockAdjustment = catchAsync(async (req, res, next) => {
  const { warehouseId, warehouseName, adjustmentType, date, lines, notes, status } = req.body;

  // Validate products exist and get their details
  const productIds = lines.map(line => line.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return next(new AppError('One or more products not found', 404));
  }

  // Enrich line items with current stock and calculate difference
  const enrichedLines = lines.map(line => {
    const product = products.find(p => p._id.toString() === line.productId);
    const warehouseStock = product.stockByLocation.find(
      s => s.warehouseId === warehouseId || s.warehouseId.toString() === warehouseId
    );
    
    const currentQty = warehouseStock ? warehouseStock.quantity : 0;
    const newQty = line.newQuantity;
    const difference = newQty - currentQty;

    return {
      productId: line.productId,
      productName: product.name,
      productSku: product.sku,
      currentQuantity: currentQty,
      newQuantity: newQty,
      difference: difference,
      unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
      reason: line.reason || ''
    };
  });

  const adjustment = await StockAdjustment.create({
    warehouseId,
    warehouseName,
    adjustmentType,
    date: date || new Date(),
    status: status || 'draft',
    lines: enrichedLines,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Stock adjustment created successfully',
    data: adjustment
  });
});

// @desc    Update stock adjustment
// @route   PUT /api/adjustments/:id
// @access  Protected (Admin/Manager only)
export const updateStockAdjustment = catchAsync(async (req, res, next) => {
  let adjustment = await StockAdjustment.findById(req.params.id);

  if (!adjustment) {
    return next(new AppError('Stock adjustment not found', 404));
  }

  if (adjustment.status === 'done') {
    return next(new AppError('Cannot update a completed adjustment', 400));
  }

  const { warehouseId, warehouseName, adjustmentType, date, lines, notes, status } = req.body;

  if (warehouseId) adjustment.warehouseId = warehouseId;
  if (warehouseName) adjustment.warehouseName = warehouseName;
  if (adjustmentType) adjustment.adjustmentType = adjustmentType;
  if (date) adjustment.date = date;
  if (notes !== undefined) adjustment.notes = notes;
  if (status) adjustment.status = status;

  if (lines) {
    const productIds = lines.map(line => line.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return next(new AppError('One or more products not found', 404));
    }

    const whId = warehouseId || adjustment.warehouseId;
    adjustment.lines = lines.map(line => {
      const product = products.find(p => p._id.toString() === line.productId);
      const warehouseStock = product.stockByLocation.find(
        s => s.warehouseId === whId || s.warehouseId.toString() === whId
      );
      
      const currentQty = warehouseStock ? warehouseStock.quantity : 0;
      const newQty = line.newQuantity;
      const difference = newQty - currentQty;

      return {
        productId: line.productId,
        productName: product.name,
        productSku: product.sku,
        currentQuantity: currentQty,
        newQuantity: newQty,
        difference: difference,
        unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
        reason: line.reason || ''
      };
    });
  }

  await adjustment.save();

  res.status(200).json({
    success: true,
    message: 'Stock adjustment updated successfully',
    data: adjustment
  });
});

// @desc    Process stock adjustment (update stock quantities)
// @route   POST /api/adjustments/:id/process
// @access  Protected (Admin/Manager only)
export const processStockAdjustment = catchAsync(async (req, res, next) => {
  const adjustment = await StockAdjustment.findById(req.params.id);

  if (!adjustment) {
    return next(new AppError('Stock adjustment not found', 404));
  }

  if (adjustment.status === 'done') {
    return next(new AppError('Adjustment already processed', 400));
  }

  // Process each line item
  for (const line of adjustment.lines) {
    const product = await Product.findById(line.productId);
    
    if (!product) {
      return next(new AppError(`Product ${line.productName} not found`, 404));
    }

    const stockIndex = product.stockByLocation.findIndex(
      s => s.warehouseId === adjustment.warehouseId || s.warehouseId.toString() === adjustment.warehouseId
    );

    const quantityBefore = stockIndex !== -1 ? product.stockByLocation[stockIndex].quantity : 0;

    if (stockIndex !== -1) {
      // Update existing location
      product.stockByLocation[stockIndex].quantity = line.newQuantity;
      
      // Remove location if quantity is 0
      if (line.newQuantity === 0) {
        product.stockByLocation.splice(stockIndex, 1);
      }
    } else if (line.newQuantity > 0) {
      // Add new location
      product.stockByLocation.push({
        warehouseId: adjustment.warehouseId,
        warehouseName: adjustment.warehouseName,
        locationId: 'default',
        locationName: 'Default Location',
        quantity: line.newQuantity
      });
    }

    await product.save();

    // Create stock movement
    await StockMovement.create({
      productId: line.productId,
      productName: line.productName,
      productSku: line.productSku,
      warehouseId: adjustment.warehouseId,
      warehouseName: adjustment.warehouseName,
      movementType: 'adjustment',
      quantity: line.difference,
      quantityBefore: quantityBefore,
      quantityAfter: line.newQuantity,
      referenceType: 'StockAdjustment',
      referenceId: adjustment._id,
      referenceNo: adjustment.referenceNo,
      unitOfMeasure: line.unitOfMeasure,
      userId: req.user._id,
      userName: req.user.name,
      notes: line.reason,
      timestamp: new Date()
    });
  }

  adjustment.status = 'done';
  adjustment.processedBy = req.user._id;
  adjustment.processedAt = new Date();
  await adjustment.save();

  res.status(200).json({
    success: true,
    message: 'Stock adjustment processed successfully',
    data: adjustment
  });
});

// @desc    Delete stock adjustment
// @route   DELETE /api/adjustments/:id
// @access  Protected (Admin only)
export const deleteStockAdjustment = catchAsync(async (req, res, next) => {
  const adjustment = await StockAdjustment.findById(req.params.id);

  if (!adjustment) {
    return next(new AppError('Stock adjustment not found', 404));
  }

  if (adjustment.status === 'done') {
    return next(new AppError('Cannot delete a processed adjustment', 400));
  }

  await adjustment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Stock adjustment deleted successfully'
  });
});

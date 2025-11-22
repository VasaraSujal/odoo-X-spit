import Receipt from '../models/Receipt.model.js';
import Product from '../models/Product.model.js';
import StockMovement from '../models/StockMovement.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Protected
export const getReceipts = catchAsync(async (req, res) => {
  const { status, warehouseId, startDate, endDate, page = 1, limit = 50 } = req.query;

  // Build query
  let query = {};

  if (status) {
    query.status = status;
  }

  if (warehouseId) {
    query.warehouseId = warehouseId;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const receipts = await Receipt.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('processedBy', 'name email');

  const total = await Receipt.countDocuments(query);

  res.status(200).json({
    success: true,
    count: receipts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: receipts
  });
});

// @desc    Get single receipt
// @route   GET /api/receipts/:id
// @access  Protected
export const getReceipt = catchAsync(async (req, res, next) => {
  const receipt = await Receipt.findById(req.params.id)
    .populate('processedBy', 'name email');

  if (!receipt) {
    return next(new AppError('Receipt not found', 404));
  }

  res.status(200).json({
    success: true,
    data: receipt
  });
});

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Protected (Admin/Manager only)
export const createReceipt = catchAsync(async (req, res, next) => {
  const { supplierName, warehouseId, warehouseName, date, lines, notes, status } = req.body;

  // Validate products exist and get their details
  const productIds = lines.map(line => line.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return next(new AppError('One or more products not found', 404));
  }

  // Validate and enrich line items
  const enrichedLines = lines.map(line => {
    const product = products.find(p => p._id.toString() === line.productId);
    return {
      productId: line.productId,
      productName: product.name,
      productSku: product.sku,
      quantity: line.quantity,
      unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
      unitPrice: line.unitPrice || 0
    };
  });

  const receipt = await Receipt.create({
    supplierName,
    warehouseId,
    warehouseName,
    date: date || new Date(),
    status: status || 'draft',
    lines: enrichedLines,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Receipt created successfully',
    data: receipt
  });
});

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Protected (Admin/Manager only)
export const updateReceipt = catchAsync(async (req, res, next) => {
  let receipt = await Receipt.findById(req.params.id);

  if (!receipt) {
    return next(new AppError('Receipt not found', 404));
  }

  // Prevent updating if already processed (done)
  if (receipt.status === 'done') {
    return next(new AppError('Cannot update a completed receipt', 400));
  }

  const { supplierName, warehouseId, warehouseName, date, lines, notes, status } = req.body;

  // Update basic fields
  if (supplierName) receipt.supplierName = supplierName;
  if (warehouseId) receipt.warehouseId = warehouseId;
  if (warehouseName) receipt.warehouseName = warehouseName;
  if (date) receipt.date = date;
  if (notes !== undefined) receipt.notes = notes;
  if (status) receipt.status = status;

  // Update lines if provided
  if (lines) {
    const productIds = lines.map(line => line.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return next(new AppError('One or more products not found', 404));
    }

    receipt.lines = lines.map(line => {
      const product = products.find(p => p._id.toString() === line.productId);
      return {
        productId: line.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: line.quantity,
        unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
        unitPrice: line.unitPrice || 0
      };
    });
  }

  await receipt.save();

  res.status(200).json({
    success: true,
    message: 'Receipt updated successfully',
    data: receipt
  });
});

// @desc    Process receipt (mark as done and update stock)
// @route   POST /api/receipts/:id/process
// @access  Protected (Admin/Manager only)
export const processReceipt = catchAsync(async (req, res, next) => {
  const receipt = await Receipt.findById(req.params.id);

  if (!receipt) {
    return next(new AppError('Receipt not found', 404));
  }

  if (receipt.status === 'done') {
    return next(new AppError('Receipt already processed', 400));
  }

  // Update stock for each line item
  for (const line of receipt.lines) {
    const product = await Product.findById(line.productId);
    
    if (!product) {
      return next(new AppError(`Product ${line.productName} not found`, 404));
    }

    // Find or create stock location
    const stockIndex = product.stockByLocation.findIndex(
      s => s.warehouseId === receipt.warehouseId || s.warehouseId.toString() === receipt.warehouseId
    );

    const quantityBefore = stockIndex !== -1 ? product.stockByLocation[stockIndex].quantity : 0;
    const quantityAfter = quantityBefore + line.quantity;

    if (stockIndex !== -1) {
      // Update existing location
      product.stockByLocation[stockIndex].quantity = quantityAfter;
    } else {
      // Add new location
      product.stockByLocation.push({
        warehouseId: receipt.warehouseId,
        warehouseName: receipt.warehouseName,
        locationId: 'default',
        locationName: 'Default Location',
        quantity: quantityAfter
      });
    }

    await product.save();

    // Create stock movement record
    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      warehouseId: receipt.warehouseId,
      warehouseName: receipt.warehouseName,
      locationId: 'default',
      locationName: 'Default Location',
      movementType: 'receipt',
      quantity: line.quantity,
      quantityBefore,
      quantityAfter,
      referenceType: 'Receipt',
      referenceId: receipt._id,
      referenceNo: receipt.referenceNo,
      unitOfMeasure: line.unitOfMeasure,
      userId: req.user._id,
      userName: req.user.name,
      notes: `Receipt from ${receipt.supplierName}`
    });
  }

  // Update receipt status
  receipt.status = 'done';
  receipt.processedBy = req.user._id;
  receipt.processedAt = new Date();
  await receipt.save();

  res.status(200).json({
    success: true,
    message: 'Receipt processed successfully',
    data: receipt
  });
});

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Protected (Admin only)
export const deleteReceipt = catchAsync(async (req, res, next) => {
  const receipt = await Receipt.findById(req.params.id);

  if (!receipt) {
    return next(new AppError('Receipt not found', 404));
  }

  // Prevent deletion if already processed
  if (receipt.status === 'done') {
    return next(new AppError('Cannot delete a processed receipt', 400));
  }

  await receipt.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Receipt deleted successfully'
  });
});

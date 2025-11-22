import InternalTransfer from '../models/InternalTransfer.model.js';
import Product from '../models/Product.model.js';
import StockMovement from '../models/StockMovement.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// @desc    Get all internal transfers
// @route   GET /api/transfers
// @access  Protected
export const getInternalTransfers = catchAsync(async (req, res, next) => {
  const { status, sourceWarehouseId, destinationWarehouseId, startDate, endDate, page = 1, limit = 50 } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (sourceWarehouseId) query.sourceWarehouseId = sourceWarehouseId;
  if (destinationWarehouseId) query.destinationWarehouseId = destinationWarehouseId;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const transfers = await InternalTransfer.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('processedBy', 'name email');

  const total = await InternalTransfer.countDocuments(query);

  res.status(200).json({
    success: true,
    count: transfers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: transfers
  });
});

// @desc    Get single internal transfer
// @route   GET /api/transfers/:id
// @access  Protected
export const getInternalTransfer = catchAsync(async (req, res, next) => {
  const transfer = await InternalTransfer.findById(req.params.id)
    .populate('processedBy', 'name email');

  if (!transfer) {
    return next(new AppError('Internal transfer not found', 404));
  }

  res.status(200).json({
    success: true,
    data: transfer
  });
});

// @desc    Create new internal transfer
// @route   POST /api/transfers
// @access  Protected (Admin/Manager only)
export const createInternalTransfer = catchAsync(async (req, res, next) => {
  const { sourceWarehouseId, sourceWarehouseName, destinationWarehouseId, destinationWarehouseName, date, lines, notes, status } = req.body;

  // Validate source and destination are different
  if (sourceWarehouseId === destinationWarehouseId) {
    return next(new AppError('Source and destination warehouses must be different', 400));
  }

  // Validate products exist and get their details
  const productIds = lines.map(line => line.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return next(new AppError('One or more products not found', 404));
  }

  // Check stock availability in source warehouse
  for (const line of lines) {
    const product = products.find(p => p._id.toString() === line.productId);
    const sourceStock = product.stockByLocation.find(
      s => s.warehouseId === sourceWarehouseId || s.warehouseId.toString() === sourceWarehouseId
    );
    
    const availableQty = sourceStock ? sourceStock.quantity : 0;
    
    if (availableQty < line.quantity) {
      return next(new AppError(
        `Insufficient stock for ${product.name} in source warehouse. Available: ${availableQty}, Requested: ${line.quantity}`,
        400
      ));
    }
  }

  // Enrich line items
  const enrichedLines = lines.map(line => {
    const product = products.find(p => p._id.toString() === line.productId);
    return {
      productId: line.productId,
      productName: product.name,
      productSku: product.sku,
      quantity: line.quantity,
      unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure
    };
  });

  const transfer = await InternalTransfer.create({
    sourceWarehouseId,
    sourceWarehouseName,
    destinationWarehouseId,
    destinationWarehouseName,
    date: date || new Date(),
    status: status || 'draft',
    lines: enrichedLines,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Internal transfer created successfully',
    data: transfer
  });
});

// @desc    Update internal transfer
// @route   PUT /api/transfers/:id
// @access  Protected (Admin/Manager only)
export const updateInternalTransfer = catchAsync(async (req, res, next) => {
  let transfer = await InternalTransfer.findById(req.params.id);

  if (!transfer) {
    return next(new AppError('Internal transfer not found', 404));
  }

  if (transfer.status === 'done') {
    return next(new AppError('Cannot update a completed transfer', 400));
  }

  const { sourceWarehouseId, sourceWarehouseName, destinationWarehouseId, destinationWarehouseName, date, lines, notes, status } = req.body;

  // Validate source and destination are different
  if ((sourceWarehouseId || transfer.sourceWarehouseId) === (destinationWarehouseId || transfer.destinationWarehouseId)) {
    return next(new AppError('Source and destination warehouses must be different', 400));
  }

  if (sourceWarehouseId) transfer.sourceWarehouseId = sourceWarehouseId;
  if (sourceWarehouseName) transfer.sourceWarehouseName = sourceWarehouseName;
  if (destinationWarehouseId) transfer.destinationWarehouseId = destinationWarehouseId;
  if (destinationWarehouseName) transfer.destinationWarehouseName = destinationWarehouseName;
  if (date) transfer.date = date;
  if (notes !== undefined) transfer.notes = notes;
  if (status) transfer.status = status;

  if (lines) {
    const productIds = lines.map(line => line.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return next(new AppError('One or more products not found', 404));
    }

    // Check stock availability
    const srcWarehouseId = sourceWarehouseId || transfer.sourceWarehouseId;
    for (const line of lines) {
      const product = products.find(p => p._id.toString() === line.productId);
      const sourceStock = product.stockByLocation.find(
        s => s.warehouseId === srcWarehouseId || s.warehouseId.toString() === srcWarehouseId
      );
      
      const availableQty = sourceStock ? sourceStock.quantity : 0;
      
      if (availableQty < line.quantity) {
        return next(new AppError(
          `Insufficient stock for ${product.name}. Available: ${availableQty}, Requested: ${line.quantity}`,
          400
        ));
      }
    }

    transfer.lines = lines.map(line => {
      const product = products.find(p => p._id.toString() === line.productId);
      return {
        productId: line.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: line.quantity,
        unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure
      };
    });
  }

  await transfer.save();

  res.status(200).json({
    success: true,
    message: 'Internal transfer updated successfully',
    data: transfer
  });
});

// @desc    Process internal transfer (move stock between warehouses)
// @route   POST /api/transfers/:id/process
// @access  Protected (Admin/Manager only)
export const processInternalTransfer = catchAsync(async (req, res, next) => {
  const transfer = await InternalTransfer.findById(req.params.id);

  if (!transfer) {
    return next(new AppError('Internal transfer not found', 404));
  }

  if (transfer.status === 'done') {
    return next(new AppError('Transfer already processed', 400));
  }

  // Process each line item
  for (const line of transfer.lines) {
    const product = await Product.findById(line.productId);
    
    if (!product) {
      return next(new AppError(`Product ${line.productName} not found`, 404));
    }

    // Remove from source warehouse
    const sourceIndex = product.stockByLocation.findIndex(
      s => s.warehouseId === transfer.sourceWarehouseId || s.warehouseId.toString() === transfer.sourceWarehouseId
    );

    if (sourceIndex === -1) {
      return next(new AppError(`No stock found for ${line.productName} in source warehouse`, 400));
    }

    const quantityBefore = product.stockByLocation[sourceIndex].quantity;
    
    if (quantityBefore < line.quantity) {
      return next(new AppError(
        `Insufficient stock for ${line.productName}. Available: ${quantityBefore}`,
        400
      ));
    }

    // Deduct from source
    product.stockByLocation[sourceIndex].quantity -= line.quantity;
    
    if (product.stockByLocation[sourceIndex].quantity === 0) {
      product.stockByLocation.splice(sourceIndex, 1);
    }

    // Add to destination
    const destIndex = product.stockByLocation.findIndex(
      s => s.warehouseId === transfer.destinationWarehouseId || s.warehouseId.toString() === transfer.destinationWarehouseId
    );

    if (destIndex !== -1) {
      product.stockByLocation[destIndex].quantity += line.quantity;
    } else {
      product.stockByLocation.push({
        warehouseId: transfer.destinationWarehouseId,
        warehouseName: transfer.destinationWarehouseName,
        locationId: 'default',
        locationName: 'Default Location',
        quantity: line.quantity
      });
    }

    await product.save();

    // Create stock movements
    await StockMovement.create([
      {
        productId: line.productId,
        productName: line.productName,
        productSku: line.productSku,
        warehouseId: transfer.sourceWarehouseId,
        warehouseName: transfer.sourceWarehouseName,
        movementType: 'transfer_out',
        quantity: -line.quantity,
        quantityBefore: quantityBefore,
        quantityAfter: quantityBefore - line.quantity,
        referenceType: 'InternalTransfer',
        referenceId: transfer._id,
        referenceNo: transfer.referenceNo,
        unitOfMeasure: line.unitOfMeasure,
        userId: req.user._id,
        userName: req.user.name,
        timestamp: new Date()
      },
      {
        productId: line.productId,
        productName: line.productName,
        productSku: line.productSku,
        warehouseId: transfer.destinationWarehouseId,
        warehouseName: transfer.destinationWarehouseName,
        movementType: 'transfer_in',
        quantity: line.quantity,
        quantityBefore: destIndex !== -1 ? product.stockByLocation[destIndex].quantity - line.quantity : 0,
        quantityAfter: destIndex !== -1 ? product.stockByLocation[destIndex].quantity : line.quantity,
        referenceType: 'InternalTransfer',
        referenceId: transfer._id,
        referenceNo: transfer.referenceNo,
        unitOfMeasure: line.unitOfMeasure,
        userId: req.user._id,
        userName: req.user.name,
        timestamp: new Date()
      }
    ]);
  }

  transfer.status = 'done';
  transfer.processedBy = req.user._id;
  transfer.processedAt = new Date();
  await transfer.save();

  res.status(200).json({
    success: true,
    message: 'Internal transfer processed successfully',
    data: transfer
  });
});

// @desc    Delete internal transfer
// @route   DELETE /api/transfers/:id
// @access  Protected (Admin only)
export const deleteInternalTransfer = catchAsync(async (req, res, next) => {
  const transfer = await InternalTransfer.findById(req.params.id);

  if (!transfer) {
    return next(new AppError('Internal transfer not found', 404));
  }

  if (transfer.status === 'done') {
    return next(new AppError('Cannot delete a processed transfer', 400));
  }

  await transfer.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Internal transfer deleted successfully'
  });
});

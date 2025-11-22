import DeliveryOrder from '../models/DeliveryOrder.model.js';
import Product from '../models/Product.model.js';
import StockMovement from '../models/StockMovement.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// @desc    Get all delivery orders
// @route   GET /api/deliveries
// @access  Protected
export const getDeliveryOrders = catchAsync(async (req, res) => {
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
  const deliveries = await DeliveryOrder.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('processedBy', 'name email');

  const total = await DeliveryOrder.countDocuments(query);

  res.status(200).json({
    success: true,
    count: deliveries.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    deliveries
  });
});

// @desc    Get single delivery order
// @route   GET /api/deliveries/:id
// @access  Protected
export const getDeliveryOrder = catchAsync(async (req, res, next) => {
  const delivery = await DeliveryOrder.findById(req.params.id)
    .populate('processedBy', 'name email');

  if (!delivery) {
    return next(new AppError('Delivery order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: delivery
  });
});

// @desc    Create new delivery order
// @route   POST /api/deliveries
// @access  Protected (Admin/Manager only)
export const createDeliveryOrder = catchAsync(async (req, res, next) => {
  const { customerName, warehouseId, warehouseName, date, lines, notes, status } = req.body;

  // Validate products exist and get their details
  const productIds = lines.map(line => line.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return next(new AppError('One or more products not found', 404));
  }

  // Check stock availability
  for (const line of lines) {
    const product = products.find(p => p._id.toString() === line.productId);
    const warehouseStock = product.stockByLocation.find(
      s => s.warehouseId === warehouseId || s.warehouseId.toString() === warehouseId
    );
    
    const availableQty = warehouseStock ? warehouseStock.quantity : 0;
    
    if (availableQty < line.quantity) {
      return next(new AppError(
        `Insufficient stock for ${product.name}. Available: ${availableQty}, Requested: ${line.quantity}`,
        400
      ));
    }
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

  const delivery = await DeliveryOrder.create({
    customerName,
    warehouseId,
    warehouseName,
    date: date || new Date(),
    status: status || 'draft',
    lines: enrichedLines,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Delivery order created successfully',
    data: delivery
  });
});

// @desc    Update delivery order
// @route   PUT /api/deliveries/:id
// @access  Protected (Admin/Manager only)
export const updateDeliveryOrder = catchAsync(async (req, res, next) => {
  let delivery = await DeliveryOrder.findById(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery order not found', 404));
  }

  // Prevent updating if already processed (done)
  if (delivery.status === 'done') {
    return next(new AppError('Cannot update a completed delivery order', 400));
  }

  const { customerName, warehouseId, warehouseName, date, lines, notes, status } = req.body;

  // Update basic fields
  if (customerName) delivery.customerName = customerName;
  if (warehouseId) delivery.warehouseId = warehouseId;
  if (warehouseName) delivery.warehouseName = warehouseName;
  if (date) delivery.date = date;
  if (notes !== undefined) delivery.notes = notes;
  if (status) delivery.status = status;

  // Update lines if provided
  if (lines) {
    const productIds = lines.map(line => line.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return next(new AppError('One or more products not found', 404));
    }

    // Check stock availability for updated lines
    for (const line of lines) {
      const product = products.find(p => p._id.toString() === line.productId);
      const targetWarehouseId = warehouseId || delivery.warehouseId.toString();
      const warehouseStock = product.stockByLocation.find(
        s => s.warehouseId === targetWarehouseId || s.warehouseId.toString() === targetWarehouseId
      );
      
      const availableQty = warehouseStock ? warehouseStock.quantity : 0;
      
      if (availableQty < line.quantity) {
        return next(new AppError(
          `Insufficient stock for ${product.name}. Available: ${availableQty}, Requested: ${line.quantity}`,
          400
        ));
      }
    }

    delivery.lines = lines.map(line => {
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

  await delivery.save();

  res.status(200).json({
    success: true,
    message: 'Delivery order updated successfully',
    data: delivery
  });
});

// @desc    Process delivery order (mark as done and update stock)
// @route   POST /api/deliveries/:id/process
// @access  Protected (Admin/Manager only)
export const processDeliveryOrder = catchAsync(async (req, res, next) => {
  const delivery = await DeliveryOrder.findById(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery order not found', 404));
  }

  if (delivery.status === 'done') {
    return next(new AppError('Delivery order already processed', 400));
  }

  // Update stock for each line item (deduct from warehouse)
  for (const line of delivery.lines) {
    const product = await Product.findById(line.productId);
    
    if (!product) {
      return next(new AppError(`Product ${line.productName} not found`, 404));
    }

    // Find stock location
    const stockIndex = product.stockByLocation.findIndex(
      s => s.warehouseId === delivery.warehouseId || s.warehouseId.toString() === delivery.warehouseId
    );

    if (stockIndex === -1) {
      return next(new AppError(`No stock found for ${line.productName} in this warehouse`, 400));
    }

    const quantityBefore = product.stockByLocation[stockIndex].quantity;

    // Check if sufficient stock
    if (quantityBefore < line.quantity) {
      return next(new AppError(
        `Insufficient stock for ${line.productName}. Available: ${quantityBefore}`,
        400
      ));
    }

    // Deduct stock
    const quantityAfter = quantityBefore - line.quantity;
    product.stockByLocation[stockIndex].quantity = quantityAfter;

    // Remove location if quantity is 0
    if (quantityAfter === 0) {
      product.stockByLocation.splice(stockIndex, 1);
    }

    await product.save();

    // Create stock movement record
    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      warehouseId: delivery.warehouseId,
      warehouseName: delivery.warehouseName,
      locationId: 'default',
      locationName: 'Default Location',
      movementType: 'delivery',
      quantity: -line.quantity,
      quantityBefore,
      quantityAfter,
      referenceType: 'DeliveryOrder',
      referenceId: delivery._id,
      referenceNo: delivery.referenceNo,
      unitOfMeasure: line.unitOfMeasure,
      userId: req.user._id,
      userName: req.user.name,
      notes: `Delivery to ${delivery.customerName}`
    });
  }

  // Update delivery status
  delivery.status = 'done';
  delivery.processedBy = req.user._id;
  delivery.processedAt = new Date();
  await delivery.save();

  res.status(200).json({
    success: true,
    message: 'Delivery order processed successfully',
    data: delivery
  });
});

// @desc    Delete delivery order
// @route   DELETE /api/deliveries/:id
// @access  Protected (Admin only)
export const deleteDeliveryOrder = catchAsync(async (req, res, next) => {
  const delivery = await DeliveryOrder.findById(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery order not found', 404));
  }

  // Prevent deletion if already processed
  if (delivery.status === 'done') {
    return next(new AppError('Cannot delete a processed delivery order', 400));
  }

  await delivery.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Delivery order deleted successfully'
  });
});

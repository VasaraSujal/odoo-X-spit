import StockMovement from '../models/StockMovement.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// @desc    Get stock movements
// @route   GET /api/stock-movements
// @access  Protected
export const getStockMovements = catchAsync(async (req, res, next) => {
  const { 
    productId, 
    warehouseId, 
    movementType, 
    startDate, 
    endDate,
    page = 1, 
    limit = 100 
  } = req.query;

  const query = {};
  
  if (productId) query.productId = productId;
  if (warehouseId) query.warehouseId = warehouseId;
  if (movementType) query.movementType = movementType;
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const movements = await StockMovement.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('productId', 'name sku')
    .populate('userId', 'name email');

  const total = await StockMovement.countDocuments(query);

  res.status(200).json({
    success: true,
    count: movements.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: movements
  });
});

// @desc    Get stock movement by ID
// @route   GET /api/stock-movements/:id
// @access  Protected
export const getStockMovement = catchAsync(async (req, res, next) => {
  const movement = await StockMovement.findById(req.params.id)
    .populate('productId', 'name sku category')
    .populate('userId', 'name email');

  if (!movement) {
    return next(new AppError('Stock movement not found', 404));
  }

  res.status(200).json({
    success: true,
    data: movement
  });
});

// @desc    Get stock movements for a product
// @route   GET /api/stock-movements/product/:productId
// @access  Protected
export const getProductMovements = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { limit = 50 } = req.query;

  const movements = await StockMovement.find({ productId })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('userId', 'name email');

  res.status(200).json({
    success: true,
    count: movements.length,
    data: movements
  });
});

import Product from '../models/Product.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Protected
export const getProducts = catchAsync(async (req, res) => {
  const { search, category, warehouseId, page = 1, limit = 50 } = req.query;

  // Build query
  let query = { isActive: true };

  // Search by name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by warehouse
  if (warehouseId) {
    query['stockByLocation.warehouseId'] = warehouseId;
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const products = await Product.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Protected
export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Protected (Admin/Manager only)
export const createProduct = catchAsync(async (req, res, next) => {
  const { name, sku, category, unitOfMeasure, description, reorderLevel } = req.body;

  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
  if (existingProduct) {
    return next(new AppError('Product with this SKU already exists', 400));
  }

  const product = await Product.create({
    name,
    sku: sku.toUpperCase(),
    category,
    unitOfMeasure: unitOfMeasure || 'Unit',
    description,
    reorderLevel: reorderLevel || 0,
    stockByLocation: []
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Protected (Admin/Manager only)
export const updateProduct = catchAsync(async (req, res, next) => {
  const { name, sku, category, unitOfMeasure, description, reorderLevel } = req.body;

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // If SKU is being updated, check for duplicates
  if (sku && sku.toUpperCase() !== product.sku) {
    const existingProduct = await Product.findOne({ 
      sku: sku.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    
    if (existingProduct) {
      return next(new AppError('Product with this SKU already exists', 400));
    }
  }

  // Update fields
  if (name) product.name = name;
  if (sku) product.sku = sku.toUpperCase();
  if (category) product.category = category;
  if (unitOfMeasure) product.unitOfMeasure = unitOfMeasure;
  if (description !== undefined) product.description = description;
  if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product
  });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Protected (Admin only)
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if product has stock
  if (product.totalStock > 0) {
    return next(new AppError('Cannot delete product with existing stock. Please adjust stock to zero first.', 400));
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get all categories
// @route   GET /api/products/categories/list
// @access  Protected
export const getCategories = catchAsync(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  
  res.status(200).json({
    success: true,
    count: categories.length,
    categories: categories.sort()
  });
});

// @desc    Update stock for a product location
// @route   PUT /api/products/:id/stock
// @access  Protected (Admin/Manager only)
export const updateStock = catchAsync(async (req, res, next) => {
  const { warehouseId, warehouseName, locationId, locationName, quantity } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Find existing stock location
  const stockIndex = product.stockByLocation.findIndex(
    s => s.warehouseId.toString() === warehouseId && s.locationId === locationId
  );

  if (stockIndex !== -1) {
    // Update existing location
    product.stockByLocation[stockIndex].quantity = quantity;
    
    // Remove if quantity is 0
    if (quantity === 0) {
      product.stockByLocation.splice(stockIndex, 1);
    }
  } else if (quantity > 0) {
    // Add new location
    product.stockByLocation.push({
      warehouseId,
      warehouseName,
      locationId,
      locationName,
      quantity
    });
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    product
  });
});

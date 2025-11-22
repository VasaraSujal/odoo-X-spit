import { body, validationResult } from 'express-validator';

// Validation for document lines
const validateLines = [
  body('lines')
    .isArray({ min: 1 })
    .withMessage('At least one line item is required'),
  
  body('lines.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('lines.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  
  body('lines.*.unitOfMeasure')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit of measure cannot be empty'),
  
  body('lines.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number')
];

// Receipt validation
export const validateReceipt = [
  body('supplierName')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ max: 200 })
    .withMessage('Supplier name cannot exceed 200 characters'),
  
  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .trim(),
  
  body('warehouseName')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .optional()
    .isIn(['draft', 'waiting', 'ready', 'done', 'canceled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  ...validateLines,

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Delivery order validation
export const validateDelivery = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 200 })
    .withMessage('Customer name cannot exceed 200 characters'),
  
  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .trim(),
  
  body('warehouseName')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .optional()
    .isIn(['draft', 'waiting', 'ready', 'done', 'canceled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  ...validateLines,

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Internal Transfer validation
export const validateTransfer = [
  body('sourceWarehouseId')
    .notEmpty()
    .withMessage('Source warehouse ID is required')
    .trim(),
  
  body('sourceWarehouseName')
    .trim()
    .notEmpty()
    .withMessage('Source warehouse name is required'),
  
  body('destinationWarehouseId')
    .notEmpty()
    .withMessage('Destination warehouse ID is required')
    .trim(),
  
  body('destinationWarehouseName')
    .trim()
    .notEmpty()
    .withMessage('Destination warehouse name is required'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .optional()
    .isIn(['draft', 'waiting', 'ready', 'done', 'canceled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('lines')
    .isArray({ min: 1 })
    .withMessage('At least one line item is required'),
  
  body('lines.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('lines.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  
  body('lines.*.unitOfMeasure')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit of measure cannot be empty'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Stock Adjustment validation
export const validateAdjustment = [
  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .trim(),
  
  body('warehouseName')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required'),
  
  body('adjustmentType')
    .isIn(['inventory_count', 'damage', 'loss', 'found', 'correction', 'other'])
    .withMessage('Invalid adjustment type'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .optional()
    .isIn(['draft', 'waiting', 'ready', 'done', 'canceled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('lines')
    .isArray({ min: 1 })
    .withMessage('At least one line item is required'),
  
  body('lines.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('lines.*.newQuantity')
    .isFloat({ min: 0 })
    .withMessage('New quantity must be 0 or greater'),
  
  body('lines.*.reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  body('lines.*.unitOfMeasure')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit of measure cannot be empty'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];


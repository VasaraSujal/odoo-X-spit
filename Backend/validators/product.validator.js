import { body, validationResult } from 'express-validator';

export const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters')
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage('SKU can only contain letters, numbers, and hyphens'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('unitOfMeasure')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit of measure cannot be empty'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a positive number'),

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

export const validateStockUpdate = [
  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
  
  body('warehouseName')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required'),
  
  body('locationId')
    .notEmpty()
    .withMessage('Location ID is required'),
  
  body('locationName')
    .trim()
    .notEmpty()
    .withMessage('Location name is required'),
  
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive number'),

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

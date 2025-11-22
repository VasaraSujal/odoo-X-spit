import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  updateStock
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateProduct, validateStockUpdate } from '../validators/product.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all categories
router.get('/categories/list', getCategories);

// Product CRUD routes
router.route('/')
  .get(getProducts)
  .post(authorize('inventory_manager'), validateProduct, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('inventory_manager'), validateProduct, updateProduct)
  .delete(authorize('inventory_manager'), deleteProduct);

// Stock management
router.put('/:id/stock', authorize('inventory_manager'), validateStockUpdate, updateStock);

export default router;

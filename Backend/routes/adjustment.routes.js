import express from 'express';
import {
  getStockAdjustments,
  getStockAdjustment,
  createStockAdjustment,
  updateStockAdjustment,
  processStockAdjustment,
  deleteStockAdjustment
} from '../controllers/adjustment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateAdjustment } from '../validators/operations.validator.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStockAdjustments)
  .post(authorize('inventory_manager'), validateAdjustment, createStockAdjustment);

router.route('/:id')
  .get(getStockAdjustment)
  .put(authorize('inventory_manager'), validateAdjustment, updateStockAdjustment)
  .delete(authorize('inventory_manager'), deleteStockAdjustment);

router.post('/:id/process', authorize('inventory_manager'), processStockAdjustment);

export default router;

import express from 'express';
import {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  processReceipt,
  deleteReceipt
} from '../controllers/receipt.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateReceipt } from '../validators/operations.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getReceipts)
  .post(authorize('inventory_manager'), validateReceipt, createReceipt);

router.route('/:id')
  .get(getReceipt)
  .put(authorize('inventory_manager'), validateReceipt, updateReceipt)
  .delete(authorize('inventory_manager'), deleteReceipt);

// Process receipt (update stock)
router.post('/:id/process', authorize('inventory_manager'), processReceipt);

export default router;

import express from 'express';
import {
  getInternalTransfers,
  getInternalTransfer,
  createInternalTransfer,
  updateInternalTransfer,
  processInternalTransfer,
  deleteInternalTransfer
} from '../controllers/transfer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateTransfer } from '../validators/operations.validator.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInternalTransfers)
  .post(authorize('inventory_manager'), validateTransfer, createInternalTransfer);

router.route('/:id')
  .get(getInternalTransfer)
  .put(authorize('inventory_manager'), validateTransfer, updateInternalTransfer)
  .delete(authorize('inventory_manager'), deleteInternalTransfer);

router.post('/:id/process', authorize('inventory_manager'), processInternalTransfer);

export default router;

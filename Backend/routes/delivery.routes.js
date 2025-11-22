import express from 'express';
import {
  getDeliveryOrders,
  getDeliveryOrder,
  createDeliveryOrder,
  updateDeliveryOrder,
  processDeliveryOrder,
  deleteDeliveryOrder
} from '../controllers/delivery.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateDelivery } from '../validators/operations.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getDeliveryOrders)
  .post(authorize('inventory_manager'), validateDelivery, createDeliveryOrder);

router.route('/:id')
  .get(getDeliveryOrder)
  .put(authorize('inventory_manager'), validateDelivery, updateDeliveryOrder)
  .delete(authorize('inventory_manager'), deleteDeliveryOrder);

// Process delivery order (update stock)
router.post('/:id/process', authorize('inventory_manager'), processDeliveryOrder);

export default router;

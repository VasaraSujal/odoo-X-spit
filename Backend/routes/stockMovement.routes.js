import express from 'express';
import {
  getStockMovements,
  getStockMovement,
  getProductMovements
} from '../controllers/stockMovement.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStockMovements);
router.get('/product/:productId', getProductMovements);
router.get('/:id', getStockMovement);

export default router;

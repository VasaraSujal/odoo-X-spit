import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productSku: {
    type: String,
    required: true
  },
  warehouseId: {
    type: String,
    required: true
  },
  warehouseName: {
    type: String,
    required: true
  },
  locationId: {
    type: String,
    default: 'default'
  },
  locationName: {
    type: String,
    default: 'Default Location'
  },
  movementType: {
    type: String,
    enum: ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  quantityBefore: {
    type: Number,
    required: true
  },
  quantityAfter: {
    type: Number,
    required: true
  },
  referenceType: {
    type: String,
    enum: ['Receipt', 'DeliveryOrder', 'InternalTransfer', 'StockAdjustment'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  referenceNo: {
    type: String,
    required: true
  },
  unitOfMeasure: {
    type: String,
    default: 'Unit'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
stockMovementSchema.index({ productId: 1, timestamp: -1 });
stockMovementSchema.index({ warehouseId: 1, timestamp: -1 });
stockMovementSchema.index({ movementType: 1, timestamp: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });
stockMovementSchema.index({ timestamp: -1 });

// Transform output
stockMovementSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;

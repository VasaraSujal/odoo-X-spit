import mongoose from 'mongoose';

const adjustmentLineSchema = new mongoose.Schema({
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
  currentQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  newQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  difference: {
    type: Number,
    required: true
  },
  unitOfMeasure: {
    type: String,
    required: true,
    default: 'Unit'
  },
  reason: {
    type: String,
    trim: true
  }
}, { _id: true });

const stockAdjustmentSchema = new mongoose.Schema({
  referenceNo: {
    type: String,
    unique: true,
    trim: true
  },
  warehouseId: {
    type: String,
    required: [true, 'Warehouse is required']
  },
  warehouseName: {
    type: String,
    required: true
  },
  adjustmentType: {
    type: String,
    enum: ['inventory_count', 'damage', 'loss', 'found', 'correction', 'other'],
    required: true,
    default: 'inventory_count'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
    default: 'draft',
    required: true
  },
  lines: {
    type: [adjustmentLineSchema],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one line item is required'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total adjustments
stockAdjustmentSchema.virtual('totalAdjustment').get(function() {
  return this.lines.reduce((total, line) => total + line.difference, 0);
});

// Auto-generate reference number before save
stockAdjustmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceNo) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.referenceNo = `ADJ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for efficient querying
stockAdjustmentSchema.index({ referenceNo: 1 });
stockAdjustmentSchema.index({ warehouseId: 1, date: -1 });
stockAdjustmentSchema.index({ adjustmentType: 1, date: -1 });
stockAdjustmentSchema.index({ status: 1, date: -1 });

// Transform output
stockAdjustmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);

export default StockAdjustment;

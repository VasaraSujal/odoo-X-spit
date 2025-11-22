import mongoose from 'mongoose';

const transferLineSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be greater than 0']
  },
  unitOfMeasure: {
    type: String,
    required: true,
    default: 'Unit'
  }
}, { _id: true });

const internalTransferSchema = new mongoose.Schema({
  referenceNo: {
    type: String,
    unique: true,
    trim: true
  },
  sourceWarehouseId: {
    type: String,
    required: [true, 'Source warehouse is required']
  },
  sourceWarehouseName: {
    type: String,
    required: true
  },
  destinationWarehouseId: {
    type: String,
    required: [true, 'Destination warehouse is required']
  },
  destinationWarehouseName: {
    type: String,
    required: true
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
    type: [transferLineSchema],
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

// Virtual for total items
internalTransferSchema.virtual('totalItems').get(function() {
  return this.lines.reduce((total, line) => total + line.quantity, 0);
});

// Auto-generate reference number before save
internalTransferSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceNo) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.referenceNo = `TRF-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for efficient querying (referenceNo already indexed via unique: true)
internalTransferSchema.index({ sourceWarehouseId: 1, date: -1 });
internalTransferSchema.index({ destinationWarehouseId: 1, date: -1 });
internalTransferSchema.index({ status: 1, date: -1 });

// Transform output
internalTransferSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const InternalTransfer = mongoose.model('InternalTransfer', internalTransferSchema);

export default InternalTransfer;

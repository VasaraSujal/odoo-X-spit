import mongoose from 'mongoose';

const documentLineSchema = new mongoose.Schema({
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
  },
  unitPrice: {
    type: Number,
    min: 0
  }
}, { _id: true });

const receiptSchema = new mongoose.Schema({
  referenceNo: {
    type: String,
    unique: true,
    trim: true
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [200, 'Supplier name cannot exceed 200 characters']
  },
  warehouseId: {
    type: String,
    required: [true, 'Warehouse is required']
  },
  warehouseName: {
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
    type: [documentLineSchema],
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
receiptSchema.virtual('totalItems').get(function() {
  return this.lines.reduce((total, line) => total + line.quantity, 0);
});

// Virtual for total value
receiptSchema.virtual('totalValue').get(function() {
  return this.lines.reduce((total, line) => {
    return total + (line.quantity * (line.unitPrice || 0));
  }, 0);
});

// Auto-generate reference number before save
receiptSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceNo) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.referenceNo = `REC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for searching and filtering
receiptSchema.index({ referenceNo: 1 });
receiptSchema.index({ supplierName: 'text' });
receiptSchema.index({ status: 1, date: -1 });
receiptSchema.index({ warehouseId: 1, date: -1 });

// Transform output
receiptSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    
    // Transform line items
    if (ret.lines) {
      ret.lines = ret.lines.map(line => ({
        id: line._id.toString(),
        productId: line.productId.toString(),
        productName: line.productName,
        productSku: line.productSku,
        quantity: line.quantity,
        unitOfMeasure: line.unitOfMeasure,
        unitPrice: line.unitPrice
      }));
    }
    
    return ret;
  }
});

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;

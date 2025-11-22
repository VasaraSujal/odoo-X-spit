import mongoose from 'mongoose';

const stockByLocationSchema = new mongoose.Schema({
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
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  unitOfMeasure: {
    type: String,
    required: [true, 'Unit of measure is required'],
    trim: true,
    default: 'Unit'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  reorderLevel: {
    type: Number,
    min: 0,
    default: 0
  },
  stockByLocation: [stockByLocationSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  return this.stockByLocation.reduce((total, location) => total + location.quantity, 0);
});

// Index for search optimization
productSchema.index({ name: 'text', sku: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });

// Transform output
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;

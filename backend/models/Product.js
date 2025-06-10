// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nama_product: {
    type: String,
    required: true,
    trim: true
  },
  deskripsi: {
    type: String,
    required: true
  },
  harga: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ nama_product: 'text', deskripsi: 'text' });

module.exports = mongoose.model('Product', productSchema);
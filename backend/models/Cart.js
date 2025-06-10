// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id_product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  jumlah: {
    type: Number,
    required: true,
    min: 1
  }
});

const cartSchema = new mongoose.Schema({
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Calculate total price
cartSchema.methods.calculateTotal = async function() {
  await this.populate('items.id_product');
  
  let total = 0;
  for (const item of this.items) {
    total += item.id_product.harga * item.jumlah;
  }
  
  return total;
};

module.exports = mongoose.model('Cart', cartSchema);
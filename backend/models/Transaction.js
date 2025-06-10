// models/Transaction.js
const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema({
  id_product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  jumlah: {
    type: Number,
    required: true,
    min: 1
  },
  sub_total: {
    type: Number,
    required: true,
    min: 0
  }
});

const transactionSchema = new mongoose.Schema({
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  total_harga: {
    type: Number,
    required: true,
    min: 0
  },
  tanggal_transaksi: {
    type: Date,
    default: Date.now
  },
  metode_pembayaran: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet'],
    required: true
  },
  status_pembayaran: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  items: [transactionItemSchema],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }]
}, {
  timestamps: true
});

// Generate transaction number
transactionSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.transaction_number = `TRX${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
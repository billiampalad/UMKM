// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  id_transaksi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  tipe_dokumen: {
    type: String,
    enum: ['invoice', 'receipt', 'warranty', 'return_form'],
    required: true
  },
  tanggal_pembuatan: {
    type: Date,
    default: Date.now
  },
  file_path: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'sent'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
const mongoose = require('mongoose');

const xeroInvoiceSchema = new mongoose.Schema({
  xeroId: {
    type: String,
    required: true,
    unique: true
  },
  invoiceNumber: String,
  contactId: String,
  contactName: String,
  invoiceType: String,
  status: String,
  lineAmountTypes: String,
  subTotal: Number,
  totalTax: Number,
  total: Number,
  amountDue: Number,
  amountPaid: Number,
  amountCredited: Number,
  currencyCode: String,
  date: Date,
  dueDate: Date,
  reference: String,
  lineItems: [{
    description: String,
    quantity: Number,
    unitAmount: Number,
    lineAmount: Number,
    accountCode: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
xeroInvoiceSchema.index({ xeroId: 1 });
xeroInvoiceSchema.index({ contactName: 1 });
xeroInvoiceSchema.index({ status: 1 });

module.exports = mongoose.model('XeroInvoice', xeroInvoiceSchema);
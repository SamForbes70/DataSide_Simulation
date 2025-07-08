const mongoose = require('mongoose');

const xeroContactSchema = new mongoose.Schema({
  xeroId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  contactStatus: String,
  isSupplier: Boolean,
  isCustomer: Boolean,
  addresses: [{
    addressType: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    region: String,
    postalCode: String,
    country: String
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
xeroContactSchema.index({ xeroId: 1 });
xeroContactSchema.index({ name: 1 });

module.exports = mongoose.model('XeroContact', xeroContactSchema);
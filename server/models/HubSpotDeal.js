const mongoose = require('mongoose');

const hubSpotDealSchema = new mongoose.Schema({
  hubspotId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  dealAmount: {
    type: Number,
    required: true,
    default: 0
  },
  dealStage: {
    type: String,
    enum: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospect'
  },
  dealName: String,
  closeDate: Date,
  pipeline: String,
  dealSource: String,
  contactId: String,
  companyId: String,
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
hubSpotDealSchema.index({ hubspotId: 1 });
hubSpotDealSchema.index({ customerName: 1 });
hubSpotDealSchema.index({ dealStage: 1 });

module.exports = mongoose.model('HubSpotDeal', hubSpotDealSchema);
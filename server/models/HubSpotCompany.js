const mongoose = require('mongoose');

const hubSpotCompanySchema = new mongoose.Schema({
  hubspotId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  domain: String,
  industry: String,
  city: String,
  state: String,
  country: String,
  numberOfEmployees: Number,
  annualRevenue: Number,
  lifecycleStage: String,
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
hubSpotCompanySchema.index({ hubspotId: 1 });
hubSpotCompanySchema.index({ name: 1 });

module.exports = mongoose.model('HubSpotCompany', hubSpotCompanySchema);
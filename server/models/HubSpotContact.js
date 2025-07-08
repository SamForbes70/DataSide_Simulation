const mongoose = require('mongoose');

const hubSpotContactSchema = new mongoose.Schema({
  hubspotId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  phone: String,
  company: String,
  jobTitle: String,
  lifecycleStage: String,
  leadStatus: String,
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
hubSpotContactSchema.index({ hubspotId: 1 });
hubSpotContactSchema.index({ email: 1 });

module.exports = mongoose.model('HubSpotContact', hubSpotContactSchema);
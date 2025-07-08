const express = require('express');
const router = express.Router();
const xeroService = require('../services/xeroService');

// GET /api/xero/contacts - Fetch and store Xero contacts
router.get('/contacts', async (req, res) => {
  try {
    console.log('Xero Routes: GET /api/xero/contacts called');
    
    // Check if we should fetch fresh data or return stored data
    const fetchFresh = req.query.refresh === 'true';
    
    let contacts;
    if (fetchFresh) {
      console.log('Xero Routes: Fetching fresh contacts from Xero API');
      contacts = await xeroService.fetchAndStoreContacts();
    } else {
      console.log('Xero Routes: Returning stored contacts from database');
      contacts = await xeroService.getStoredContacts();
    }
    
    res.status(200).json({
      success: true,
      message: `Retrieved ${contacts.length} Xero contacts`,
      data: contacts,
      count: contacts.length
    });
    
  } catch (error) {
    console.error('Xero Routes: Error in GET /api/xero/contacts:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/xero/invoices - Fetch and store Xero invoices
router.get('/invoices', async (req, res) => {
  try {
    console.log('Xero Routes: GET /api/xero/invoices called');
    
    // Check if we should fetch fresh data or return stored data
    const fetchFresh = req.query.refresh === 'true';
    
    let invoices;
    if (fetchFresh) {
      console.log('Xero Routes: Fetching fresh invoices from Xero API');
      invoices = await xeroService.fetchAndStoreInvoices();
    } else {
      console.log('Xero Routes: Returning stored invoices from database');
      invoices = await xeroService.getStoredInvoices();
    }
    
    res.status(200).json({
      success: true,
      message: `Retrieved ${invoices.length} Xero invoices`,
      data: invoices,
      count: invoices.length
    });
    
  } catch (error) {
    console.error('Xero Routes: Error in GET /api/xero/invoices:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
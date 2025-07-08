const express = require('express');
const router = express.Router();
const hubspotService = require('../services/hubspotService');

// GET /api/hubspot/contacts - Fetch and store HubSpot contacts
router.get('/contacts', async (req, res) => {
  try {
    console.log('HubSpot Routes: GET /api/hubspot/contacts called');
    
    // Check if we should fetch fresh data or return stored data
    const fetchFresh = req.query.refresh === 'true';
    
    let contacts;
    if (fetchFresh) {
      console.log('HubSpot Routes: Fetching fresh contacts from HubSpot API');
      contacts = await hubspotService.fetchAndStoreContacts();
    } else {
      console.log('HubSpot Routes: Returning stored contacts from database');
      contacts = await hubspotService.getStoredContacts();
    }
    
    res.status(200).json({
      success: true,
      message: `Retrieved ${contacts.length} HubSpot contacts`,
      data: contacts,
      count: contacts.length
    });
    
  } catch (error) {
    console.error('HubSpot Routes: Error in GET /api/hubspot/contacts:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/hubspot/companies - Fetch and store HubSpot companies
router.get('/companies', async (req, res) => {
  try {
    console.log('HubSpot Routes: GET /api/hubspot/companies called');
    
    // Check if we should fetch fresh data or return stored data
    const fetchFresh = req.query.refresh === 'true';
    
    let companies;
    if (fetchFresh) {
      console.log('HubSpot Routes: Fetching fresh companies from HubSpot API');
      companies = await hubspotService.fetchAndStoreCompanies();
    } else {
      console.log('HubSpot Routes: Returning stored companies from database');
      companies = await hubspotService.getStoredCompanies();
    }
    
    res.status(200).json({
      success: true,
      message: `Retrieved ${companies.length} HubSpot companies`,
      data: companies,
      count: companies.length
    });
    
  } catch (error) {
    console.error('HubSpot Routes: Error in GET /api/hubspot/companies:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
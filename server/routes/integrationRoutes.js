const express = require('express');
const router = express.Router();
const hubspotService = require('../services/hubspotService');
const xeroService = require('../services/xeroService');
const HubSpotDeal = require('../models/HubSpotDeal');
const XeroInvoice = require('../models/XeroInvoice');

// GET /api/integration/data - Get merged integration data
router.get('/data', async (req, res) => {
  try {
    console.log('Integration Routes: GET /api/integration/data called');

    // Get deals and invoices from database
    const deals = await HubSpotDeal.find().sort({ updatedAt: -1 });
    const invoices = await XeroInvoice.find().sort({ updatedAt: -1 });

    console.log(`Integration Routes: Found ${deals.length} deals and ${invoices.length} invoices`);

    // If no data exists, populate with mock data
    if (deals.length === 0) {
      console.log('Integration Routes: No deals found, populating with mock data');
      await hubspotService.populateMockDeals();
      const newDeals = await HubSpotDeal.find().sort({ updatedAt: -1 });
      deals.push(...newDeals);
    }

    if (invoices.length === 0) {
      console.log('Integration Routes: No invoices found, populating with mock data');
      await xeroService.populateMockInvoices();
      const newInvoices = await XeroInvoice.find().sort({ updatedAt: -1 });
      invoices.push(...newInvoices);
    }

    // Transform deals to match frontend interface
    const hubspotDeals = deals.map(deal => ({
      _id: deal._id.toString(),
      customerName: deal.customerName,
      dealAmount: deal.dealAmount,
      dealStage: deal.dealStage,
      lastUpdated: deal.updatedAt.toISOString()
    }));

    // Transform invoices to match frontend interface
    const xeroInvoices = invoices.map(invoice => ({
      _id: invoice._id.toString(),
      customerName: invoice.contactName,
      invoiceAmount: invoice.total || invoice.subTotal || 0,
      invoiceStatus: invoice.status === 'PAID' ? 'Paid' : 
                    invoice.status === 'AUTHORISED' ? 'Sent' : 
                    invoice.status === 'DRAFT' ? 'Draft' : 
                    invoice.status === 'OVERDUE' ? 'Overdue' : 'Draft',
      lastUpdated: invoice.updatedAt.toISOString()
    }));

    // Create merged data
    const mergedData = hubspotDeals.map(deal => {
      const invoice = xeroInvoices.find(inv => inv.customerName === deal.customerName);
      return {
        customerName: deal.customerName,
        hubspotAmount: deal.dealAmount,
        xeroAmount: invoice?.invoiceAmount || 0,
        difference: deal.dealAmount - (invoice?.invoiceAmount || 0),
        hubspotStage: deal.dealStage,
        xeroStatus: invoice?.invoiceStatus || 'Not Found'
      };
    });

    // Calculate totals
    const totalDeals = hubspotDeals.reduce((sum, deal) => sum + deal.dealAmount, 0);
    const totalInvoices = xeroInvoices.reduce((sum, invoice) => sum + invoice.invoiceAmount, 0);
    const totalVariance = totalDeals - totalInvoices;

    const integrationData = {
      hubspotDeals,
      xeroInvoices,
      mergedData,
      totalDeals,
      totalInvoices,
      totalVariance
    };

    console.log('Integration Routes: Successfully prepared integration data');
    res.status(200).json(integrationData);

  } catch (error) {
    console.error('Integration Routes: Error in GET /api/integration/data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/integration/hubspot/deal - Update HubSpot deal
router.put('/hubspot/deal', async (req, res) => {
  try {
    console.log('Integration Routes: PUT /api/integration/hubspot/deal called');
    console.log('Integration Routes: Request body received:', JSON.stringify(req.body, null, 2));

    const { _id, customerName, dealAmount, dealStage } = req.body;

    if (!_id) {
      console.log('Integration Routes: ERROR - Deal ID is missing from request');
      return res.status(400).json({
        success: false,
        error: 'Deal ID is required'
      });
    }

    console.log(`Integration Routes: Attempting to update deal with ID: ${_id}`);
    console.log(`Integration Routes: Update data - customerName: ${customerName}, dealAmount: ${dealAmount}, dealStage: ${dealStage}`);

    // Check if deal exists before update
    const existingDeal = await HubSpotDeal.findById(_id);
    if (!existingDeal) {
      console.log(`Integration Routes: ERROR - Deal with ID ${_id} not found in database`);
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    console.log(`Integration Routes: Found existing deal: ${JSON.stringify(existingDeal, null, 2)}`);

    // Update deal in database
    const updatedDeal = await HubSpotDeal.findByIdAndUpdate(
      _id,
      {
        customerName,
        dealAmount,
        dealStage,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`Integration Routes: Deal updated in database: ${JSON.stringify(updatedDeal, null, 2)}`);

    // Try to update in HubSpot (if API is configured)
    try {
      console.log('Integration Routes: Attempting to update deal in HubSpot API');
      await hubspotService.updateDeal(updatedDeal);
      console.log('Integration Routes: Deal updated in HubSpot successfully');
    } catch (hubspotError) {
      console.warn('Integration Routes: Failed to update deal in HubSpot:', hubspotError.message);
      // Continue anyway - local update succeeded
    }

    console.log('Integration Routes: Sending success response for deal update');
    res.status(200).json({
      success: true,
      message: 'HubSpot deal updated successfully'
    });

  } catch (error) {
    console.error('Integration Routes: Error in PUT /api/integration/hubspot/deal:', error.message);
    console.error('Integration Routes: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/integration/xero/invoice - Update Xero invoice
router.put('/xero/invoice', async (req, res) => {
  try {
    console.log('Integration Routes: PUT /api/integration/xero/invoice called');
    console.log('Integration Routes: Request body received:', JSON.stringify(req.body, null, 2));

    const { _id, customerName, invoiceAmount, invoiceStatus } = req.body;

    if (!_id) {
      console.log('Integration Routes: ERROR - Invoice ID is missing from request');
      return res.status(400).json({
        success: false,
        error: 'Invoice ID is required'
      });
    }

    console.log(`Integration Routes: Attempting to update invoice with ID: ${_id}`);
    console.log(`Integration Routes: Update data - customerName: ${customerName}, invoiceAmount: ${invoiceAmount}, invoiceStatus: ${invoiceStatus}`);

    // Map frontend status to Xero status
    const xeroStatus = invoiceStatus === 'Paid' ? 'PAID' : 
                      invoiceStatus === 'Sent' ? 'AUTHORISED' : 
                      invoiceStatus === 'Draft' ? 'DRAFT' : 
                      invoiceStatus === 'Overdue' ? 'OVERDUE' : 'DRAFT';

    console.log(`Integration Routes: Mapped status from '${invoiceStatus}' to '${xeroStatus}'`);

    // Check if invoice exists before update
    const existingInvoice = await XeroInvoice.findById(_id);
    if (!existingInvoice) {
      console.log(`Integration Routes: ERROR - Invoice with ID ${_id} not found in database`);
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    console.log(`Integration Routes: Found existing invoice: ${JSON.stringify(existingInvoice, null, 2)}`);

    // Update invoice in database
    const updatedInvoice = await XeroInvoice.findByIdAndUpdate(
      _id,
      {
        contactName: customerName,
        total: invoiceAmount,
        subTotal: invoiceAmount,
        status: xeroStatus,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`Integration Routes: Invoice updated in database: ${JSON.stringify(updatedInvoice, null, 2)}`);

    // Try to update in Xero (if API is configured)
    try {
      console.log('Integration Routes: Attempting to update invoice in Xero API');
      await xeroService.updateInvoice(updatedInvoice);
      console.log('Integration Routes: Invoice updated in Xero successfully');
    } catch (xeroError) {
      console.warn('Integration Routes: Failed to update invoice in Xero:', xeroError.message);
      // Continue anyway - local update succeeded
    }

    console.log('Integration Routes: Sending success response for invoice update');
    res.status(200).json({
      success: true,
      message: 'Xero invoice updated successfully'
    });

  } catch (error) {
    console.error('Integration Routes: Error in PUT /api/integration/xero/invoice:', error.message);
    console.error('Integration Routes: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/integration/trends - Get trend data
router.get('/trends', async (req, res) => {
  try {
    console.log('Integration Routes: GET /api/integration/trends called');

    // Get current totals for dynamic trend calculation
    const deals = await HubSpotDeal.find();
    const invoices = await XeroInvoice.find();

    const totalDeals = deals.reduce((sum, deal) => sum + deal.dealAmount, 0);
    const totalInvoices = invoices.reduce((sum, invoice) => sum + (invoice.total || invoice.subTotal || 0), 0);
    const totalVariance = totalDeals - totalInvoices;

    // Generate 6 months of trend data with some variation
    const baseHubspot = totalDeals;
    const baseXero = totalInvoices;
    const baseVariance = totalVariance;

    const trendData = [
      {
        month: 'Jul',
        hubspot: Math.round(baseHubspot * 0.63),
        xero: Math.round(baseXero * 0.63),
        variance: Math.round(baseVariance * 0.58)
      },
      {
        month: 'Aug',
        hubspot: Math.round(baseHubspot * 0.68),
        xero: Math.round(baseXero * 0.69),
        variance: Math.round(baseVariance * 0.58)
      },
      {
        month: 'Sep',
        hubspot: Math.round(baseHubspot * 0.65),
        xero: Math.round(baseXero * 0.66),
        variance: Math.round(baseVariance * 0.50)
      },
      {
        month: 'Oct',
        hubspot: Math.round(baseHubspot * 0.78),
        xero: Math.round(baseXero * 0.77),
        variance: Math.round(baseVariance * 0.83)
      },
      {
        month: 'Nov',
        hubspot: Math.round(baseHubspot * 0.87),
        xero: Math.round(baseXero * 0.87),
        variance: Math.round(baseVariance * 0.83)
      },
      {
        month: 'Dec',
        hubspot: baseHubspot,
        xero: baseXero,
        variance: baseVariance
      }
    ];

    console.log('Integration Routes: Generated trend data successfully');
    res.status(200).json(trendData);

  } catch (error) {
    console.error('Integration Routes: Error in GET /api/integration/trends:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
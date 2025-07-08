const { Client } = require('@hubspot/api-client');
const HubSpotContact = require('../models/HubSpotContact');
const HubSpotCompany = require('../models/HubSpotCompany');
const HubSpotDeal = require('../models/HubSpotDeal');

class HubSpotService {
  constructor() {
    if (!process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN === 'your_hubspot_access_token_here') {
      console.warn('HubSpotService: Missing or placeholder HubSpot access token in environment variables');
      this.client = null;
    } else {
      this.client = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
      console.log('HubSpotService: Successfully initialized HubSpot client');
    }
  }

  async fetchAndStoreContacts() {
    try {
      console.log('HubSpotService: Starting to fetch contacts from HubSpot');

      if (!this.client) {
        console.log('HubSpotService: HubSpot client not initialized, returning mock data');
        return this.getMockContacts();
      }

      const properties = [
        'email', 'firstname', 'lastname', 'phone', 'company',
        'jobtitle', 'lifecyclestage', 'hs_lead_status'
      ];

      let allContacts = [];
      let after = undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.crm.contacts.basicApi.getPage(
          100, // limit
          after, // after
          properties, // properties
          undefined, // propertiesWithHistory
          undefined, // associations
          false // archived
        );

        allContacts = allContacts.concat(response.results);

        if (response.paging && response.paging.next) {
          after = response.paging.next.after;
        } else {
          hasMore = false;
        }
      }

      console.log(`HubSpotService: Fetched ${allContacts.length} contacts from HubSpot`);

      // Store contacts in database
      const storedContacts = [];
      for (const contact of allContacts) {
        try {
          const contactData = {
            hubspotId: contact.id,
            email: contact.properties.email || '',
            firstName: contact.properties.firstname || '',
            lastName: contact.properties.lastname || '',
            phone: contact.properties.phone || '',
            company: contact.properties.company || '',
            jobTitle: contact.properties.jobtitle || '',
            lifecycleStage: contact.properties.lifecyclestage || '',
            leadStatus: contact.properties.hs_lead_status || '',
            lastSyncedAt: new Date()
          };

          const savedContact = await HubSpotContact.findOneAndUpdate(
            { hubspotId: contact.id },
            contactData,
            { upsert: true, new: true }
          );

          storedContacts.push(savedContact);
        } catch (error) {
          console.error(`HubSpotService: Error storing contact ${contact.id}:`, error.message);
        }
      }

      console.log(`HubSpotService: Stored ${storedContacts.length} contacts in database`);
      return storedContacts;

    } catch (error) {
      console.error('HubSpotService: Error fetching contacts:', error.message);
      console.log('HubSpotService: Falling back to mock data');
      return this.getMockContacts();
    }
  }

  async fetchAndStoreCompanies() {
    try {
      console.log('HubSpotService: Starting to fetch companies from HubSpot');

      if (!this.client) {
        console.log('HubSpotService: HubSpot client not initialized, returning mock data');
        return this.getMockCompanies();
      }

      const properties = [
        'name', 'domain', 'industry', 'city', 'state', 'country',
        'numberofemployees', 'annualrevenue', 'lifecyclestage'
      ];

      let allCompanies = [];
      let after = undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.crm.companies.basicApi.getPage(
          100, // limit
          after, // after
          properties, // properties
          undefined, // propertiesWithHistory
          undefined, // associations
          false // archived
        );

        allCompanies = allCompanies.concat(response.results);

        if (response.paging && response.paging.next) {
          after = response.paging.next.after;
        } else {
          hasMore = false;
        }
      }

      console.log(`HubSpotService: Fetched ${allCompanies.length} companies from HubSpot`);

      // Store companies in database
      const storedCompanies = [];
      for (const company of allCompanies) {
        try {
          const companyData = {
            hubspotId: company.id,
            name: company.properties.name || '',
            domain: company.properties.domain || '',
            industry: company.properties.industry || '',
            city: company.properties.city || '',
            state: company.properties.state || '',
            country: company.properties.country || '',
            numberOfEmployees: company.properties.numberofemployees ? parseInt(company.properties.numberofemployees) : null,
            annualRevenue: company.properties.annualrevenue ? parseFloat(company.properties.annualrevenue) : null,
            lifecycleStage: company.properties.lifecyclestage || '',
            lastSyncedAt: new Date()
          };

          const savedCompany = await HubSpotCompany.findOneAndUpdate(
            { hubspotId: company.id },
            companyData,
            { upsert: true, new: true }
          );

          storedCompanies.push(savedCompany);
        } catch (error) {
          console.error(`HubSpotService: Error storing company ${company.id}:`, error.message);
        }
      }

      console.log(`HubSpotService: Stored ${storedCompanies.length} companies in database`);
      return storedCompanies;

    } catch (error) {
      console.error('HubSpotService: Error fetching companies:', error.message);
      console.log('HubSpotService: Falling back to mock data');
      return this.getMockCompanies();
    }
  }

  async updateDeal(deal) {
    try {
      console.log('HubSpotService: Attempting to update deal in HubSpot:', deal.customerName);

      if (!this.client) {
        console.log('HubSpotService: HubSpot client not initialized, skipping HubSpot update');
        return;
      }

      // If we have a hubspotId, try to update the deal in HubSpot
      if (deal.hubspotId) {
        const properties = {
          dealname: deal.customerName,
          amount: deal.dealAmount.toString(),
          dealstage: deal.dealStage.toLowerCase().replace(' ', '_')
        };

        await this.client.crm.deals.basicApi.update(deal.hubspotId, { properties });
        console.log('HubSpotService: Successfully updated deal in HubSpot');
      } else {
        console.log('HubSpotService: No HubSpot ID found for deal, skipping HubSpot update');
      }

    } catch (error) {
      console.error('HubSpotService: Error updating deal in HubSpot:', error.message);
      throw error;
    }
  }

  async populateMockDeals() {
    console.log('HubSpotService: Populating mock deals');
    const mockDeals = [
      {
        hubspotId: 'mock-deal-1',
        customerName: 'Acme Corporation',
        dealAmount: 25000,
        dealStage: 'Closed Won',
        dealName: 'Acme Corp - Q1 Project',
        closeDate: new Date('2024-01-15'),
        pipeline: 'Sales Pipeline',
        dealSource: 'Website',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-deal-2',
        customerName: 'TechStart Inc',
        dealAmount: 18500,
        dealStage: 'Negotiation',
        dealName: 'TechStart - Development Services',
        closeDate: new Date('2024-02-01'),
        pipeline: 'Sales Pipeline',
        dealSource: 'Referral',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-deal-3',
        customerName: 'Global Solutions',
        dealAmount: 32000,
        dealStage: 'Closed Won',
        dealName: 'Global Solutions - Consulting',
        closeDate: new Date('2024-01-13'),
        pipeline: 'Sales Pipeline',
        dealSource: 'Cold Call',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-deal-4',
        customerName: 'Innovation Labs',
        dealAmount: 15000,
        dealStage: 'Proposal',
        dealName: 'Innovation Labs - R&D Project',
        closeDate: new Date('2024-02-15'),
        pipeline: 'Sales Pipeline',
        dealSource: 'LinkedIn',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-deal-5',
        customerName: 'Enterprise Co',
        dealAmount: 45000,
        dealStage: 'Qualified',
        dealName: 'Enterprise Co - Software License',
        closeDate: new Date('2024-02-28'),
        pipeline: 'Sales Pipeline',
        dealSource: 'Trade Show',
        lastSyncedAt: new Date()
      }
    ];

    // Store mock deals in database
    const storedDeals = [];
    for (const dealData of mockDeals) {
      try {
        const savedDeal = await HubSpotDeal.findOneAndUpdate(
          { hubspotId: dealData.hubspotId },
          dealData,
          { upsert: true, new: true }
        );
        storedDeals.push(savedDeal);
      } catch (error) {
        console.error(`HubSpotService: Error storing mock deal ${dealData.hubspotId}:`, error.message);
      }
    }

    console.log(`HubSpotService: Stored ${storedDeals.length} mock deals`);
    return storedDeals;
  }

  async getMockContacts() {
    console.log('HubSpotService: Generating mock contacts');
    const mockContacts = [
      {
        hubspotId: 'mock-contact-1',
        email: 'john.doe@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        company: 'Acme Corporation',
        jobTitle: 'CEO',
        lifecycleStage: 'customer',
        leadStatus: 'QUALIFIED',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-contact-2',
        email: 'jane.smith@techstart.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0202',
        company: 'TechStart Inc',
        jobTitle: 'CTO',
        lifecycleStage: 'opportunity',
        leadStatus: 'NEW',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-contact-3',
        email: 'bob.wilson@globalsolutions.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        phone: '+1-555-0303',
        company: 'Global Solutions',
        jobTitle: 'VP Sales',
        lifecycleStage: 'customer',
        leadStatus: 'QUALIFIED',
        lastSyncedAt: new Date()
      }
    ];

    // Store mock contacts in database
    const storedContacts = [];
    for (const contactData of mockContacts) {
      try {
        const savedContact = await HubSpotContact.findOneAndUpdate(
          { hubspotId: contactData.hubspotId },
          contactData,
          { upsert: true, new: true }
        );
        storedContacts.push(savedContact);
      } catch (error) {
        console.error(`HubSpotService: Error storing mock contact ${contactData.hubspotId}:`, error.message);
      }
    }

    return storedContacts;
  }

  async getMockCompanies() {
    console.log('HubSpotService: Generating mock companies');
    const mockCompanies = [
      {
        hubspotId: 'mock-company-1',
        name: 'Acme Corporation',
        domain: 'acme.com',
        industry: 'Technology',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        numberOfEmployees: 500,
        annualRevenue: 10000000,
        lifecycleStage: 'customer',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-company-2',
        name: 'TechStart Inc',
        domain: 'techstart.com',
        industry: 'Software',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        numberOfEmployees: 50,
        annualRevenue: 2000000,
        lifecycleStage: 'opportunity',
        lastSyncedAt: new Date()
      },
      {
        hubspotId: 'mock-company-3',
        name: 'Global Solutions',
        domain: 'globalsolutions.com',
        industry: 'Consulting',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        numberOfEmployees: 200,
        annualRevenue: 5000000,
        lifecycleStage: 'customer',
        lastSyncedAt: new Date()
      }
    ];

    // Store mock companies in database
    const storedCompanies = [];
    for (const companyData of mockCompanies) {
      try {
        const savedCompany = await HubSpotCompany.findOneAndUpdate(
          { hubspotId: companyData.hubspotId },
          companyData,
          { upsert: true, new: true }
        );
        storedCompanies.push(savedCompany);
      } catch (error) {
        console.error(`HubSpotService: Error storing mock company ${companyData.hubspotId}:`, error.message);
      }
    }

    return storedCompanies;
  }

  async getStoredContacts() {
    try {
      return await HubSpotContact.find().sort({ updatedAt: -1 });
    } catch (error) {
      console.error('HubSpotService: Error getting stored contacts:', error.message);
      throw new Error(`Failed to get stored contacts: ${error.message}`);
    }
  }

  async getStoredCompanies() {
    try {
      return await HubSpotCompany.find().sort({ updatedAt: -1 });
    } catch (error) {
      console.error('HubSpotService: Error getting stored companies:', error.message);
      throw new Error(`Failed to get stored companies: ${error.message}`);
    }
  }
}

module.exports = new HubSpotService();
// Add debugging to see what's actually exported from xero-node
console.log('XeroService: Debugging xero-node imports...');
const xeroNodeModule = require('xero-node');
console.log('XeroService: xero-node module keys:', Object.keys(xeroNodeModule));
console.log('XeroService: XeroApi type:', typeof xeroNodeModule.XeroApi);
console.log('XeroService: Available exports:', xeroNodeModule);

const { XeroApi } = require('xero-node');
const XeroContact = require('../models/XeroContact');
const XeroInvoice = require('../models/XeroInvoice');

class XeroService {
  constructor() {
    // Check if we have the required environment variables
    if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET || 
        process.env.XERO_CLIENT_ID === 'your_xero_client_id_here' ||
        process.env.XERO_CLIENT_SECRET === 'your_xero_client_secret_here') {
      console.warn('XeroService: Missing or placeholder Xero credentials in environment variables');
      this.xero = null;
      return;
    }

    try {
      console.log('XeroService: Attempting to create XeroApi instance...');
      
      this.xero = new XeroApi({
        clientId: process.env.XERO_CLIENT_ID,
        clientSecret: process.env.XERO_CLIENT_SECRET,
        redirectUris: [process.env.XERO_REDIRECT_URI || 'http://localhost:3000/callback'],
        scopes: 'accounting.contacts accounting.transactions'
      });
      console.log('XeroService: Successfully initialized XeroApi client');
    } catch (error) {
      console.error('XeroService: Error initializing XeroApi client:', error.message);
      console.log('XeroService: Falling back to mock data mode');
      this.xero = null;
    }
  }

  async getAccessToken() {
    // In a real implementation, you would handle OAuth flow and token refresh
    // For now, we'll assume the token is stored and valid
    if (!process.env.XERO_ACCESS_TOKEN) {
      throw new Error('XERO_ACCESS_TOKEN not found in environment variables');
    }

    const tokenData = {
      access_token: process.env.XERO_ACCESS_TOKEN,
      refresh_token: process.env.XERO_REFRESH_TOKEN,
      token_type: 'Bearer',
      expires_in: 1800
    };

    return tokenData;
  }

  async fetchAndStoreContacts() {
    try {
      console.log('XeroService: Starting to fetch contacts from Xero');

      if (!this.xero) {
        console.log('XeroService: Xero client not initialized, returning mock data');
        return this.getMockContacts();
      }

      const tokenSet = await this.getAccessToken();
      await this.xero.setTokenSet(tokenSet);

      const response = await this.xero.accountingApi.getContacts(
        process.env.XERO_TENANT_ID
      );

      const contacts = response.body.contacts || [];
      console.log(`XeroService: Fetched ${contacts.length} contacts from Xero`);

      // Store contacts in database
      const storedContacts = [];
      for (const contact of contacts) {
        try {
          const contactData = {
            xeroId: contact.contactID,
            name: contact.name || '',
            email: contact.emailAddress || '',
            phone: contact.phones && contact.phones.length > 0 ? contact.phones[0].phoneNumber : '',
            contactStatus: contact.contactStatus || '',
            isSupplier: contact.isSupplier || false,
            isCustomer: contact.isCustomer || false,
            addresses: contact.addresses ? contact.addresses.map(addr => ({
              addressType: addr.addressType,
              addressLine1: addr.addressLine1,
              addressLine2: addr.addressLine2,
              city: addr.city,
              region: addr.region,
              postalCode: addr.postalCode,
              country: addr.country
            })) : [],
            lastSyncedAt: new Date()
          };

          const savedContact = await XeroContact.findOneAndUpdate(
            { xeroId: contact.contactID },
            contactData,
            { upsert: true, new: true }
          );

          storedContacts.push(savedContact);
        } catch (error) {
          console.error(`XeroService: Error storing contact ${contact.contactID}:`, error.message);
        }
      }

      console.log(`XeroService: Stored ${storedContacts.length} contacts in database`);
      return storedContacts;

    } catch (error) {
      console.error('XeroService: Error fetching contacts:', error.message);
      console.log('XeroService: Falling back to mock data');
      return this.getMockContacts();
    }
  }

  async fetchAndStoreInvoices() {
    try {
      console.log('XeroService: Starting to fetch invoices from Xero');

      if (!this.xero) {
        console.log('XeroService: Xero client not initialized, returning mock data');
        return this.getMockInvoices();
      }

      const tokenSet = await this.getAccessToken();
      await this.xero.setTokenSet(tokenSet);

      const response = await this.xero.accountingApi.getInvoices(
        process.env.XERO_TENANT_ID
      );

      const invoices = response.body.invoices || [];
      console.log(`XeroService: Fetched ${invoices.length} invoices from Xero`);

      // Store invoices in database
      const storedInvoices = [];
      for (const invoice of invoices) {
        try {
          const invoiceData = {
            xeroId: invoice.invoiceID,
            invoiceNumber: invoice.invoiceNumber || '',
            contactId: invoice.contact ? invoice.contact.contactID : '',
            contactName: invoice.contact ? invoice.contact.name : '',
            invoiceType: invoice.type || '',
            status: invoice.status || '',
            lineAmountTypes: invoice.lineAmountTypes || '',
            subTotal: invoice.subTotal || 0,
            totalTax: invoice.totalTax || 0,
            total: invoice.total || 0,
            amountDue: invoice.amountDue || 0,
            amountPaid: invoice.amountPaid || 0,
            amountCredited: invoice.amountCredited || 0,
            currencyCode: invoice.currencyCode || 'USD',
            date: invoice.date ? new Date(invoice.date) : null,
            dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
            reference: invoice.reference || '',
            lineItems: invoice.lineItems ? invoice.lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitAmount: item.unitAmount,
              lineAmount: item.lineAmount,
              accountCode: item.accountCode
            })) : [],
            lastSyncedAt: new Date()
          };

          const savedInvoice = await XeroInvoice.findOneAndUpdate(
            { xeroId: invoice.invoiceID },
            invoiceData,
            { upsert: true, new: true }
          );

          storedInvoices.push(savedInvoice);
        } catch (error) {
          console.error(`XeroService: Error storing invoice ${invoice.invoiceID}:`, error.message);
        }
      }

      console.log(`XeroService: Stored ${storedInvoices.length} invoices in database`);
      return storedInvoices;

    } catch (error) {
      console.error('XeroService: Error fetching invoices:', error.message);
      console.log('XeroService: Falling back to mock data');
      return this.getMockInvoices();
    }
  }

  async updateInvoice(invoice) {
    try {
      console.log('XeroService: Attempting to update invoice in Xero:', invoice.contactName);

      if (!this.xero) {
        console.log('XeroService: Xero client not initialized, skipping Xero update');
        return;
      }

      // If we have a xeroId, try to update the invoice in Xero
      if (invoice.xeroId) {
        const tokenSet = await this.getAccessToken();
        await this.xero.setTokenSet(tokenSet);

        const invoiceData = {
          invoiceID: invoice.xeroId,
          status: invoice.status,
          total: invoice.total,
          subTotal: invoice.subTotal || invoice.total
        };

        await this.xero.accountingApi.updateInvoice(
          process.env.XERO_TENANT_ID,
          invoice.xeroId,
          { invoices: [invoiceData] }
        );
        console.log('XeroService: Successfully updated invoice in Xero');
      } else {
        console.log('XeroService: No Xero ID found for invoice, skipping Xero update');
      }

    } catch (error) {
      console.error('XeroService: Error updating invoice in Xero:', error.message);
      throw error;
    }
  }

  async populateMockInvoices() {
    console.log('XeroService: Populating mock invoices');
    const mockInvoices = [
      {
        xeroId: 'mock-invoice-1',
        invoiceNumber: 'INV-001',
        contactId: 'mock-contact-1',
        contactName: 'Acme Corporation',
        invoiceType: 'ACCREC',
        status: 'PAID',
        lineAmountTypes: 'Exclusive',
        subTotal: 22000,
        totalTax: 2200,
        total: 22000,
        amountDue: 0,
        amountPaid: 22000,
        amountCredited: 0,
        currencyCode: 'USD',
        date: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        reference: 'Project Alpha',
        lineItems: [{
          description: 'Consulting Services',
          quantity: 1,
          unitAmount: 22000,
          lineAmount: 22000,
          accountCode: '200'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-invoice-2',
        invoiceNumber: 'INV-002',
        contactId: 'mock-contact-2',
        contactName: 'TechStart Inc',
        invoiceType: 'ACCREC',
        status: 'AUTHORISED',
        lineAmountTypes: 'Exclusive',
        subTotal: 18500,
        totalTax: 1850,
        total: 18500,
        amountDue: 18500,
        amountPaid: 0,
        amountCredited: 0,
        currencyCode: 'USD',
        date: new Date('2024-01-14'),
        dueDate: new Date('2024-02-14'),
        reference: 'Development Services',
        lineItems: [{
          description: 'Software Development',
          quantity: 1,
          unitAmount: 18500,
          lineAmount: 18500,
          accountCode: '200'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-invoice-3',
        invoiceNumber: 'INV-003',
        contactId: 'mock-contact-3',
        contactName: 'Global Solutions',
        invoiceType: 'ACCREC',
        status: 'PAID',
        lineAmountTypes: 'Exclusive',
        subTotal: 28000,
        totalTax: 2800,
        total: 28000,
        amountDue: 0,
        amountPaid: 28000,
        amountCredited: 0,
        currencyCode: 'USD',
        date: new Date('2024-01-13'),
        dueDate: new Date('2024-02-13'),
        reference: 'Consulting Project',
        lineItems: [{
          description: 'Business Consulting',
          quantity: 1,
          unitAmount: 28000,
          lineAmount: 28000,
          accountCode: '200'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-invoice-4',
        invoiceNumber: 'INV-004',
        contactId: 'mock-contact-4',
        contactName: 'Innovation Labs',
        invoiceType: 'ACCREC',
        status: 'DRAFT',
        lineAmountTypes: 'Exclusive',
        subTotal: 15000,
        totalTax: 1500,
        total: 15000,
        amountDue: 15000,
        amountPaid: 0,
        amountCredited: 0,
        currencyCode: 'USD',
        date: new Date('2024-01-12'),
        dueDate: new Date('2024-02-12'),
        reference: 'Innovation Project',
        lineItems: [{
          description: 'R&D Services',
          quantity: 1,
          unitAmount: 15000,
          lineAmount: 15000,
          accountCode: '200'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-invoice-5',
        invoiceNumber: 'INV-005',
        contactId: 'mock-contact-5',
        contactName: 'Enterprise Co',
        invoiceType: 'ACCREC',
        status: 'OVERDUE',
        lineAmountTypes: 'Exclusive',
        subTotal: 40000,
        totalTax: 4000,
        total: 40000,
        amountDue: 40000,
        amountPaid: 0,
        amountCredited: 0,
        currencyCode: 'USD',
        date: new Date('2024-01-11'),
        dueDate: new Date('2024-02-11'),
        reference: 'Enterprise Solution',
        lineItems: [{
          description: 'Enterprise Software License',
          quantity: 1,
          unitAmount: 40000,
          lineAmount: 40000,
          accountCode: '200'
        }],
        lastSyncedAt: new Date()
      }
    ];

    // Store mock invoices in database
    const storedInvoices = [];
    for (const invoiceData of mockInvoices) {
      try {
        const savedInvoice = await XeroInvoice.findOneAndUpdate(
          { xeroId: invoiceData.xeroId },
          invoiceData,
          { upsert: true, new: true }
        );
        storedInvoices.push(savedInvoice);
      } catch (error) {
        console.error(`XeroService: Error storing mock invoice ${invoiceData.xeroId}:`, error.message);
      }
    }

    console.log(`XeroService: Stored ${storedInvoices.length} mock invoices`);
    return storedInvoices;
  }

  async getMockContacts() {
    console.log('XeroService: Generating mock contacts');
    const mockContacts = [
      {
        xeroId: 'mock-contact-1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0101',
        contactStatus: 'ACTIVE',
        isSupplier: false,
        isCustomer: true,
        addresses: [{
          addressType: 'STREET',
          addressLine1: '123 Business St',
          city: 'New York',
          region: 'NY',
          postalCode: '10001',
          country: 'US'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-contact-2',
        name: 'TechStart Inc',
        email: 'hello@techstart.com',
        phone: '+1-555-0202',
        contactStatus: 'ACTIVE',
        isSupplier: false,
        isCustomer: true,
        addresses: [{
          addressType: 'STREET',
          addressLine1: '456 Tech Ave',
          city: 'San Francisco',
          region: 'CA',
          postalCode: '94105',
          country: 'US'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-contact-3',
        name: 'Global Solutions',
        email: 'info@globalsolutions.com',
        phone: '+1-555-0303',
        contactStatus: 'ACTIVE',
        isSupplier: false,
        isCustomer: true,
        addresses: [{
          addressType: 'STREET',
          addressLine1: '789 Enterprise Blvd',
          city: 'Chicago',
          region: 'IL',
          postalCode: '60601',
          country: 'US'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-contact-4',
        name: 'Innovation Labs',
        email: 'contact@innovationlabs.com',
        phone: '+1-555-0404',
        contactStatus: 'ACTIVE',
        isSupplier: false,
        isCustomer: true,
        addresses: [{
          addressType: 'STREET',
          addressLine1: '321 Innovation Way',
          city: 'Austin',
          region: 'TX',
          postalCode: '73301',
          country: 'US'
        }],
        lastSyncedAt: new Date()
      },
      {
        xeroId: 'mock-contact-5',
        name: 'Enterprise Co',
        email: 'hello@enterpriseco.com',
        phone: '+1-555-0505',
        contactStatus: 'ACTIVE',
        isSupplier: false,
        isCustomer: true,
        addresses: [{
          addressType: 'STREET',
          addressLine1: '654 Corporate Dr',
          city: 'Seattle',
          region: 'WA',
          postalCode: '98101',
          country: 'US'
        }],
        lastSyncedAt: new Date()
      }
    ];

    // Store mock contacts in database
    const storedContacts = [];
    for (const contactData of mockContacts) {
      try {
        const savedContact = await XeroContact.findOneAndUpdate(
          { xeroId: contactData.xeroId },
          contactData,
          { upsert: true, new: true }
        );
        storedContacts.push(savedContact);
      } catch (error) {
        console.error(`XeroService: Error storing mock contact ${contactData.xeroId}:`, error.message);
      }
    }

    return storedContacts;
  }

  async getMockInvoices() {
    return this.populateMockInvoices();
  }

  async getStoredContacts() {
    try {
      return await XeroContact.find().sort({ updatedAt: -1 });
    } catch (error) {
      console.error('XeroService: Error getting stored contacts:', error.message);
      throw new Error(`Failed to get stored contacts: ${error.message}`);
    }
  }

  async getStoredInvoices() {
    try {
      return await XeroInvoice.find().sort({ updatedAt: -1 });
    } catch (error) {
      console.error('XeroService: Error getting stored invoices:', error.message);
      throw new Error(`Failed to get stored invoices: ${error.message}`);
    }
  }
}

module.exports = new XeroService();
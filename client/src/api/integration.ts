import api from './api'
import type { IntegrationData, HubSpotDeal, XeroInvoice, TrendDataPoint } from '@/types/integration'

// Description: Get integration data from HubSpot and Xero
// Endpoint: GET /api/integration/data
// Request: {}
// Response: IntegrationData
export const getIntegrationData = async (): Promise<IntegrationData> => {
  try {
    const response = await api.get('/api/integration/data')
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Update HubSpot deal
// Endpoint: PUT /api/integration/hubspot/deal
// Request: HubSpotDeal
// Response: { success: boolean, message: string }
export const updateHubSpotDeal = async (deal: HubSpotDeal): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('API: updateHubSpotDeal called with:', JSON.stringify(deal, null, 2));
    console.log('API: Deal ID being sent:', deal._id);
    
    const response = await api.put('/api/integration/hubspot/deal', deal);
    console.log('API: HubSpot deal update response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('API: Error updating HubSpot deal:', error);
    console.error('API: Error response:', error?.response?.data);
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Update Xero invoice
// Endpoint: PUT /api/integration/xero/invoice
// Request: XeroInvoice
// Response: { success: boolean, message: string }
export const updateXeroInvoice = async (invoice: XeroInvoice): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('API: updateXeroInvoice called with:', JSON.stringify(invoice, null, 2));
    console.log('API: Invoice ID being sent:', invoice._id);
    
    const response = await api.put('/api/integration/xero/invoice', invoice);
    console.log('API: Xero invoice update response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('API: Error updating Xero invoice:', error);
    console.error('API: Error response:', error?.response?.data);
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Get trend data for charts
// Endpoint: GET /api/integration/trends
// Request: {}
// Response: TrendDataPoint[]
export const getTrendData = async (): Promise<TrendDataPoint[]> => {
  try {
    const response = await api.get('/api/integration/trends')
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Get HubSpot contacts
// Endpoint: GET /api/hubspot/contacts
// Request: { refresh?: boolean }
// Response: { success: boolean, message: string, data: Array, count: number }
export const getHubSpotContacts = async (refresh = false): Promise<{ success: boolean, message: string, data: any[], count: number }> => {
  try {
    const response = await api.get(`/api/hubspot/contacts${refresh ? '?refresh=true' : ''}`)
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Get HubSpot companies
// Endpoint: GET /api/hubspot/companies
// Request: { refresh?: boolean }
// Response: { success: boolean, message: string, data: Array, count: number }
export const getHubSpotCompanies = async (refresh = false): Promise<{ success: boolean, message: string, data: any[], count: number }> => {
  try {
    const response = await api.get(`/api/hubspot/companies${refresh ? '?refresh=true' : ''}`)
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Get Xero contacts
// Endpoint: GET /api/xero/contacts
// Request: { refresh?: boolean }
// Response: { success: boolean, message: string, data: Array, count: number }
export const getXeroContacts = async (refresh = false): Promise<{ success: boolean, message: string, data: any[], count: number }> => {
  try {
    const response = await api.get(`/api/xero/contacts${refresh ? '?refresh=true' : ''}`)
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message)
  }
}

// Description: Get Xero invoices
// Endpoint: GET /api/xero/invoices
// Request: { refresh?: boolean }
// Response: { success: boolean, message: string, data: Array, count: number }
export const getXeroInvoices = async (refresh = false): Promise<{ success: boolean, message: string, data: any[], count: number }> => {
  try {
    const response = await api.get(`/api/xero/invoices${refresh ? '?refresh=true' : ''}`)
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message)
  }
}
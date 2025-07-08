export interface HubSpotDeal {
  _id: string
  customerName: string
  dealAmount: number
  dealStage: 'Prospect' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost'
  lastUpdated: string
}

export interface XeroInvoice {
  _id: string
  customerName: string
  invoiceAmount: number
  invoiceStatus: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
  lastUpdated: string
}

export interface MergedDataItem {
  customerName: string
  hubspotAmount: number
  xeroAmount: number
  difference: number
  hubspotStage: string
  xeroStatus: string
}

export interface IntegrationData {
  hubspotDeals: HubSpotDeal[]
  xeroInvoices: XeroInvoice[]
  mergedData: MergedDataItem[]
  totalDeals: number
  totalInvoices: number
  totalVariance: number
}

export interface TrendDataPoint {
  month: string
  hubspot: number
  xero: number
  variance: number
}
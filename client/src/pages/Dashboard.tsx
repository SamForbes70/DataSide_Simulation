import { useState, useEffect } from 'react'
import { KPICards } from '@/components/dashboard/KPICards'
import { DataTable } from '@/components/dashboard/DataTable'
import { HubSpotModal } from '@/components/dashboard/HubSpotModal'
import { XeroModal } from '@/components/dashboard/XeroModal'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus'
import { CustomerFilter } from '@/components/dashboard/CustomerFilter'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { getIntegrationData, updateHubSpotDeal, updateXeroInvoice } from '@/api/integration'
import { useToast } from '@/hooks/useToast'
import type { IntegrationData, HubSpotDeal, XeroInvoice } from '@/types/integration'

export function Dashboard() {
  const [data, setData] = useState<IntegrationData | null>(null)
  const [filteredData, setFilteredData] = useState<IntegrationData | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hubspotModalOpen, setHubspotModalOpen] = useState(false)
  const [xeroModalOpen, setXeroModalOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<HubSpotDeal | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<XeroInvoice | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    console.log('Dashboard: Loading initial data')
    loadData()
  }, [])

  useEffect(() => {
    if (data) {
      console.log('Dashboard: Filtering data for customer:', selectedCustomer)
      if (selectedCustomer === 'all') {
        setFilteredData(data)
      } else {
        const filtered = {
          ...data,
          mergedData: data.mergedData.filter(item => item.customerName === selectedCustomer)
        }
        setFilteredData(filtered)
      }
    }
  }, [data, selectedCustomer])

  const loadData = async () => {
    try {
      console.log('Dashboard: Fetching integration data')
      const response = await getIntegrationData()
      setData(response)
      setRefreshTrigger(prev => prev + 1)
      console.log('Dashboard: Data loaded successfully, refresh trigger:', refreshTrigger + 1)
    } catch (error) {
      console.error('Dashboard: Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load integration data",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = async () => {
    console.log('Dashboard: Refreshing data')
    setIsRefreshing(true)
    try {
      await loadData()
      toast({
        title: "Success",
        description: "Data refreshed successfully"
      })
    } catch (error) {
      console.error('Dashboard: Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleEditDeal = (customerName: string) => {
    console.log('Dashboard: Opening HubSpot modal for customer:', customerName)
    const deal = data?.hubspotDeals.find(d => d.customerName === customerName)
    if (deal) {
      setSelectedDeal(deal)
      setHubspotModalOpen(true)
    }
  }

  const handleEditInvoice = (customerName: string) => {
    console.log('Dashboard: Opening Xero modal for customer:', customerName)
    const invoice = data?.xeroInvoices.find(i => i.customerName === customerName)
    if (invoice) {
      setSelectedInvoice(invoice)
      setXeroModalOpen(true)
    }
  }

  const handleSaveDeal = async (updatedDeal: HubSpotDeal) => {
    try {
      console.log('Dashboard: Saving HubSpot deal:', JSON.stringify(updatedDeal, null, 2));
      console.log('Dashboard: Deal ID being sent:', updatedDeal._id);
      
      const response = await updateHubSpotDeal(updatedDeal);
      console.log('Dashboard: Update response received:', response);
      
      console.log('Dashboard: Reloading data after deal update');
      await loadData();
      
      setHubspotModalOpen(false);
      console.log('Dashboard: Modal closed, showing success toast');
      
      toast({
        title: "Success",
        description: "HubSpot deal updated successfully"
      });
    } catch (error) {
      console.error('Dashboard: Error saving deal:', error);
      console.error('Dashboard: Error details:', error.message);
      toast({
        title: "Error",
        description: "Failed to update HubSpot deal",
        variant: "destructive"
      })
    }
  }

  const handleSaveInvoice = async (updatedInvoice: XeroInvoice) => {
    try {
      console.log('Dashboard: Saving Xero invoice:', JSON.stringify(updatedInvoice, null, 2));
      console.log('Dashboard: Invoice ID being sent:', updatedInvoice._id);
      
      const response = await updateXeroInvoice(updatedInvoice);
      console.log('Dashboard: Update response received:', response);
      
      console.log('Dashboard: Reloading data after invoice update');
      await loadData();
      
      setXeroModalOpen(false);
      console.log('Dashboard: Modal closed, showing success toast');
      
      toast({
        title: "Success",
        description: "Xero invoice updated successfully"
      });
    } catch (error) {
      console.error('Dashboard: Error saving invoice:', error);
      console.error('Dashboard: Error details:', error.message);
      toast({
        title: "Error",
        description: "Failed to update Xero invoice",
        variant: "destructive"
      })
    }
  }

  if (!data || !filteredData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: '#00BB9E' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#002D6F', fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif' }}>
            DataSide™
          </h1>
          <p className="text-muted-foreground mt-1" style={{ fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif' }}>
            Managed data-platform accelerator — Real-time integration demo
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CustomerFilter
            customers={data.mergedData.map(item => item.customerName)}
            selectedCustomer={selectedCustomer}
            onCustomerChange={setSelectedCustomer}
          />
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: '#00BB9E',
              fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 600
            }}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* KPI Cards */}
      <KPICards data={filteredData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Table - Takes 2 columns */}
        <div className="lg:col-span-2">
          <DataTable
            data={filteredData.mergedData}
            onEditDeal={handleEditDeal}
            onEditInvoice={handleEditInvoice}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <InsightsPanel data={filteredData} />
          <TrendChart refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Modals */}
      <HubSpotModal
        open={hubspotModalOpen}
        onOpenChange={setHubspotModalOpen}
        deal={selectedDeal}
        onSave={handleSaveDeal}
      />

      <XeroModal
        open={xeroModalOpen}
        onOpenChange={setXeroModalOpen}
        invoice={selectedInvoice}
        onSave={handleSaveInvoice}
      />
    </div>
  )
}
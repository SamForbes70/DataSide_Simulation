import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { XeroInvoice } from '@/types/integration'

interface XeroModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: XeroInvoice | null
  onSave: (invoice: XeroInvoice) => Promise<void>
}

export function XeroModal({ open, onOpenChange, invoice, onSave }: XeroModalProps) {
  const [formData, setFormData] = useState<XeroInvoice | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (invoice) {
      console.log('XeroModal: Setting form data for invoice:', JSON.stringify(invoice, null, 2));
      console.log('XeroModal: Invoice ID:', invoice._id);
      setFormData({ ...invoice })
    }
  }, [invoice])

  const handleSave = async () => {
    if (!formData) {
      console.log('XeroModal: No form data available for save');
      return;
    }

    console.log('XeroModal: Saving invoice data:', JSON.stringify(formData, null, 2));
    console.log('XeroModal: Form data ID:', formData._id);
    
    setIsLoading(true);
    try {
      await onSave(formData);
      console.log('XeroModal: Invoice saved successfully');
    } catch (error) {
      console.error('XeroModal: Error saving invoice:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    setFormData(prev => prev ? { ...prev, invoiceAmount: numericValue } : null)
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            Edit Xero Invoice
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              value={formData.customerName}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Invoice Amount ($)</Label>
            <Input
              id="amount"
              type="text"
              value={formData.invoiceAmount.toLocaleString()}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter invoice amount"
              className="text-right"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Invoice Status</Label>
            <Select
              value={formData.invoiceStatus}
              onValueChange={(value) => setFormData(prev => prev ? { ...prev, invoiceStatus: value as XeroInvoice['invoiceStatus'] } : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select invoice status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { HubSpotDeal } from '@/types/integration'

interface HubSpotModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: HubSpotDeal | null
  onSave: (deal: HubSpotDeal) => Promise<void>
}

export function HubSpotModal({ open, onOpenChange, deal, onSave }: HubSpotModalProps) {
  const [formData, setFormData] = useState<HubSpotDeal | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (deal) {
      console.log('HubSpotModal: Setting form data for deal:', JSON.stringify(deal, null, 2));
      console.log('HubSpotModal: Deal ID:', deal._id);
      setFormData({ ...deal })
    }
  }, [deal])

  const handleSave = async () => {
    if (!formData) {
      console.log('HubSpotModal: No form data available for save');
      return;
    }

    console.log('HubSpotModal: Saving deal data:', JSON.stringify(formData, null, 2));
    console.log('HubSpotModal: Form data ID:', formData._id);
    
    setIsLoading(true);
    try {
      await onSave(formData);
      console.log('HubSpotModal: Deal saved successfully');
    } catch (error) {
      console.error('HubSpotModal: Error saving deal:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    setFormData(prev => prev ? { ...prev, dealAmount: numericValue } : null)
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            Edit HubSpot Deal
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
            <Label htmlFor="amount">Deal Amount ($)</Label>
            <Input
              id="amount"
              type="text"
              value={formData.dealAmount.toLocaleString()}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter deal amount"
              className="text-right"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stage">Deal Stage</Label>
            <Select
              value={formData.dealStage}
              onValueChange={(value) => setFormData(prev => prev ? { ...prev, dealStage: value as HubSpotDeal['dealStage'] } : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deal stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prospect">Prospect</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
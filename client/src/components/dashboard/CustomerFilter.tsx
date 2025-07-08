import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Users } from 'lucide-react'

interface CustomerFilterProps {
  customers: string[]
  selectedCustomer: string
  onCustomerChange: (customer: string) => void
}

export function CustomerFilter({ customers, selectedCustomer, onCustomerChange }: CustomerFilterProps) {
  const uniqueCustomers = Array.from(new Set(customers)).sort()

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="customer-filter" className="text-sm font-medium flex items-center gap-1">
        <Users className="h-4 w-4" />
        Filter by Customer:
      </Label>
      <Select value={selectedCustomer} onValueChange={onCustomerChange}>
        <SelectTrigger className="w-48 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Customers</SelectItem>
          {uniqueCustomers.map((customer) => (
            <SelectItem key={customer} value={customer}>
              {customer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
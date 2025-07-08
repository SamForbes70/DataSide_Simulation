import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, Edit, TrendingUp, TrendingDown } from 'lucide-react'
import type { MergedDataItem } from '@/types/integration'

interface DataTableProps {
  data: MergedDataItem[]
  onEditDeal: (customerName: string) => void
  onEditInvoice: (customerName: string) => void
}

type SortField = 'customerName' | 'hubspotAmount' | 'xeroAmount' | 'difference'
type SortDirection = 'asc' | 'desc'

export function DataTable({ data, onEditDeal, onEditInvoice }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('customerName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Closed Won': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Negotiation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Proposal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/20 dark:border-gray-800/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          Data Integration Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('customerName')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Customer Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('hubspotAmount')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    HubSpot Deal ($)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('xeroAmount')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Xero Invoice ($)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('difference')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Difference ($)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow
                  key={item.customerName}
                  className={`
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                    ${item.difference > 0 ? 'bg-green-50/50 dark:bg-green-900/10' : ''}
                  `}
                >
                  <TableCell className="font-medium">{item.customerName}</TableCell>
                  <TableCell className="text-blue-600 dark:text-blue-400 font-semibold">
                    {formatCurrency(item.hubspotAmount)}
                  </TableCell>
                  <TableCell className="text-purple-600 dark:text-purple-400 font-semibold">
                    {formatCurrency(item.xeroAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.difference > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : item.difference < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                      <span className={`font-semibold ${
                        item.difference > 0 ? 'text-green-600' :
                        item.difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatCurrency(Math.abs(item.difference))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStageColor(item.hubspotStage)} variant="secondary">
                        {item.hubspotStage}
                      </Badge>
                      <Badge className={getStatusColor(item.xeroStatus)} variant="secondary">
                        {item.xeroStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditDeal(item.customerName)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Deal
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditInvoice(item.customerName)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Invoice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, FileText, BarChart3 } from 'lucide-react'
import type { IntegrationData } from '@/types/integration'

interface KPICardsProps {
  data: IntegrationData
}

export function KPICards({ data }: KPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600'
    if (variance < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />
    if (variance < 0) return <TrendingDown className="h-4 w-4" />
    return <BarChart3 className="h-4 w-4" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Deals Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Total Deals (HubSpot)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(data.totalDeals)}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            From {data.hubspotDeals.length} active deals
          </p>
        </CardContent>
      </Card>

      {/* Total Invoices Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Total Invoices (Xero)
          </CardTitle>
          <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(data.totalInvoices)}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            From {data.xeroInvoices.length} invoices
          </p>
        </CardContent>
      </Card>

      {/* Total Variance Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Total Variance
          </CardTitle>
          <div className={getVarianceColor(data.totalVariance)}>
            {getVarianceIcon(data.totalVariance)}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getVarianceColor(data.totalVariance)}`}>
            {formatCurrency(Math.abs(data.totalVariance))}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {data.totalVariance >= 0 ? 'Deals exceed invoices' : 'Invoices exceed deals'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, Users, DollarSign } from 'lucide-react'
import type { IntegrationData } from '@/types/integration'

interface InsightsPanelProps {
  data: IntegrationData
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getHighestVarianceCustomer = () => {
    return data.mergedData.reduce((max, current) =>
      Math.abs(current.difference) > Math.abs(max.difference) ? current : max
    )
  }

  const getPositiveVarianceCount = () => {
    return data.mergedData.filter(item => item.difference > 0).length
  }

  const getAverageDealSize = () => {
    return data.totalDeals / data.hubspotDeals.length
  }

  const highestVarianceCustomer = getHighestVarianceCustomer()
  const positiveVarianceCount = getPositiveVarianceCount()
  const averageDealSize = getAverageDealSize()

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Highest Variance Customer
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                <span className="font-semibold">{highestVarianceCustomer.customerName}</span>
                <span>has a variance of</span>
                <Badge variant="outline">
                  {formatCurrency(Math.abs(highestVarianceCustomer.difference))}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Positive Variance Analysis
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                <Badge variant="outline">
                  {positiveVarianceCount}
                </Badge>
                <span>out of {data.mergedData.length} customers have deals exceeding invoices</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <DollarSign className="h-4 w-4 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Average Deal Size
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                <span>Current average deal value is</span>
                <Badge variant="outline">
                  {formatCurrency(averageDealSize)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            Insights update automatically with data changes
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
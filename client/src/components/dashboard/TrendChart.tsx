import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTrendData } from '@/api/integration'
import type { TrendDataPoint } from '@/types/integration'

interface TrendChartProps {
  refreshTrigger?: number // Add a prop to trigger refresh
}

export function TrendChart({ refreshTrigger }: TrendChartProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTrendData = async () => {
    try {
      setIsLoading(true)
      console.log('TrendChart: Loading trend data...')
      const data = await getTrendData()
      console.log('TrendChart: Trend data loaded:', data)
      setTrendData(data)
    } catch (error) {
      console.error('TrendChart: Error loading trend data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('TrendChart: Initial load or refresh triggered')
    loadTrendData()
  }, [refreshTrigger]) // Re-fetch when refreshTrigger changes

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>6-Month Trend Analysis</CardTitle>
          <CardDescription>Historical comparison of HubSpot vs Xero data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading trend data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>6-Month Trend Analysis</CardTitle>
        <CardDescription>Historical comparison of HubSpot vs Xero data</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'hubspot' ? 'HubSpot' : name === 'xero' ? 'Xero' : 'Variance'
              ]}
            />
            <Legend 
              formatter={(value) => 
                value === 'hubspot' ? 'HubSpot Deals' : 
                value === 'xero' ? 'Xero Invoices' : 
                'Variance'
              }
            />
            <Line 
              type="monotone" 
              dataKey="hubspot" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="xero" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="variance" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
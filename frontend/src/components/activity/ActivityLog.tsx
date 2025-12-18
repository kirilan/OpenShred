import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useActivities } from '@/hooks/useActivities'
import { useBrokers } from '@/hooks/useBrokers'
import type { Activity, ActivityType } from '@/types'
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  ScanSearch,
  AlertTriangle,
  Info,
  Loader2,
  type LucideIcon
} from 'lucide-react'

const activityIcons: Record<ActivityType, LucideIcon> = {
  request_created: Clock,
  request_sent: Mail,
  response_received: CheckCircle,
  response_scanned: ScanSearch,
  email_scanned: ScanSearch,
  broker_detected: AlertTriangle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const activityColors: Record<ActivityType, string> = {
  request_created: 'text-yellow-500 bg-yellow-50',
  request_sent: 'text-blue-500 bg-blue-50',
  response_received: 'text-green-500 bg-green-50',
  response_scanned: 'text-purple-500 bg-purple-50',
  email_scanned: 'text-indigo-500 bg-indigo-50',
  broker_detected: 'text-orange-500 bg-orange-50',
  error: 'text-red-500 bg-red-50',
  warning: 'text-yellow-600 bg-yellow-50',
  info: 'text-gray-500 bg-gray-50'
}

export function ActivityLog() {
  const [filterBroker, setFilterBroker] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  const { data: activities, isLoading } = useActivities(filterBroker, filterType)
  const { data: brokers } = useBrokers()

  const brokerMap = new Map(brokers?.map(b => [b.id, b.name]) || [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Track all actions and events related to your deletion requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterBroker || 'all'}
          onChange={(e) => setFilterBroker(e.target.value === 'all' ? null : e.target.value)}
          className="border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Brokers</option>
          {brokers?.map(broker => (
            <option key={broker.id} value={broker.id}>{broker.name}</option>
          ))}
        </select>

        <select
          value={filterType || 'all'}
          onChange={(e) => setFilterType(e.target.value === 'all' ? null : e.target.value)}
          className="border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Types</option>
          <option value="request_created">Requests Created</option>
          <option value="request_sent">Requests Sent</option>
          <option value="response_received">Responses Received</option>
          <option value="error">Errors Only</option>
        </select>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {activities?.map((activity: Activity, index: number) => {
              const Icon = activityIcons[activity.activity_type] || Info
              const colorClass = activityColors[activity.activity_type] || 'text-gray-500 bg-gray-50'

              return (
                <div key={activity.id} className="relative pl-8 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                  )}

                  {/* Icon */}
                  <div className={`absolute left-0 top-1 p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{activity.message}</p>
                        {activity.broker_id && (
                          <p className="text-sm text-muted-foreground">
                            {brokerMap.get(activity.broker_id) || 'Unknown Broker'}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

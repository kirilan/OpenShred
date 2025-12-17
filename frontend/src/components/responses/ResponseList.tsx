import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResponses, useScanResponses } from '@/hooks/useResponses'
import type { BrokerResponse, BrokerResponseType } from '@/types'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  Mail
} from 'lucide-react'

const responseTypeConfig: Record<BrokerResponseType, { icon: any; color: string; bg: string; label: string }> = {
  confirmation: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Confirmation' },
  rejection: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejection' },
  acknowledgment: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Acknowledged' },
  request_info: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Info Requested' },
  unknown: { icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown' }
}

export function ResponseList() {
  const [filterType, setFilterType] = useState<BrokerResponseType | 'all'>('all')
  const { data: responses, isLoading, error } = useResponses()
  const scanResponses = useScanResponses()

  const handleScan = async () => {
    await scanResponses.mutateAsync(7)
  }

  const filteredResponses = responses?.filter(
    r => filterType === 'all' || r.response_type === filterType
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <XCircle className="h-12 w-12 mb-4" />
        <p>Failed to load responses</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broker Responses</h1>
        <p className="text-muted-foreground">
          View and manage responses from data brokers
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleScan}
            disabled={scanResponses.isPending}
            variant="default"
          >
            {scanResponses.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan for Responses
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as BrokerResponseType | 'all')}
            className="text-sm border rounded-md px-3 py-1.5 bg-background"
          >
            <option value="all">All Types</option>
            <option value="confirmation">Confirmations</option>
            <option value="rejection">Rejections</option>
            <option value="acknowledgment">Acknowledged</option>
            <option value="request_info">Info Requested</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      {/* Response Cards */}
      {filteredResponses && filteredResponses.length > 0 ? (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No responses found. Scan for responses to check if brokers have replied.
            </p>
            <Button onClick={handleScan} disabled={scanResponses.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ResponseCard({ response }: { response: BrokerResponse }) {
  const [expanded, setExpanded] = useState(false)
  const config = responseTypeConfig[response.response_type] || responseTypeConfig.unknown
  const Icon = config.icon

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${config.bg} ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              {response.confidence_score !== null && (
                <Badge variant="secondary">
                  {Math.round(response.confidence_score * 100)}% confidence
                </Badge>
              )}
              {response.matched_by && (
                <Badge variant="outline">
                  Matched: {response.matched_by}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">From:</span> {response.sender_email}
              </p>
              {response.subject && (
                <p className="text-sm">
                  <span className="font-medium">Subject:</span> {response.subject}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Received:</span> {formatDate(response.received_date)}
              </p>
              {response.deletion_request_id && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Linked to Request:</span> {response.deletion_request_id.substring(0, 8)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {response.body_text && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border">
              <p className={expanded ? '' : 'line-clamp-3'}>
                {response.body_text}
              </p>
            </div>
            {response.body_text.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmailScans } from '@/hooks/useEmails'
import { EmailScan } from '@/types'
import { Mail, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

export function EmailList() {
  const [showBrokersOnly, setShowBrokersOnly] = useState(false)
  const { data: emails, isLoading, error } = useEmailScans(showBrokersOnly)

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
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p>Failed to load emails</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scanned Emails</h1>
          <p className="text-muted-foreground">
            {emails?.length || 0} emails found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showBrokersOnly ? 'default' : 'outline'}
            onClick={() => setShowBrokersOnly(!showBrokersOnly)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {showBrokersOnly ? 'Showing Brokers Only' : 'Show All'}
          </Button>
        </div>
      </div>

      {emails && emails.length > 0 ? (
        <div className="space-y-4">
          {emails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {showBrokersOnly
                ? 'No broker emails found. Try scanning your inbox first.'
                : 'No emails scanned yet. Start a scan to find data broker emails.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function EmailCard({ email }: { email: EmailScan }) {
  const confidencePercent = email.confidence_score
    ? Math.round(email.confidence_score * 100)
    : null

  const truncatedPreview = email.body_preview
    ? email.body_preview.length > 150
      ? email.body_preview.substring(0, 150) + '...'
      : email.body_preview
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-medium">
              {email.subject || '(No Subject)'}
            </CardTitle>
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">From:</span> {email.sender_email}
              </p>
              {email.recipient_email && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">To:</span> {email.recipient_email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {email.is_broker_email ? (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Data Broker
              </Badge>
            ) : (
              <Badge variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Safe
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {truncatedPreview && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border">
            <p className="line-clamp-3">{truncatedPreview}</p>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {email.broker_id && (
              <span className="text-muted-foreground">
                Broker ID: {email.broker_id}
              </span>
            )}
            {confidencePercent !== null && (
              <span className="text-muted-foreground">
                Confidence: {confidencePercent}%
              </span>
            )}
          </div>
          <span className="text-muted-foreground">
            {email.received_date
              ? new Date(email.received_date).toLocaleDateString()
              : 'Unknown date'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

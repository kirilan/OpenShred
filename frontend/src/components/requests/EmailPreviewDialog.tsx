import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requestsApi } from '@/services/api'
import { DeletionRequest, GeneratedEmail } from '@/types'
import { X, Copy, Check, Loader2, Mail } from 'lucide-react'

interface EmailPreviewDialogProps {
  request: DeletionRequest | null
  onClose: () => void
}

export function EmailPreviewDialog({ request, onClose }: EmailPreviewDialogProps) {
  const [email, setEmail] = useState<GeneratedEmail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'subject' | 'body' | null>(null)

  useEffect(() => {
    if (request) {
      loadEmailPreview()
    } else {
      setEmail(null)
      setError(null)
    }
  }, [request])

  const loadEmailPreview = async () => {
    if (!request) return

    setIsLoading(true)
    setError(null)

    try {
      const preview = await requestsApi.previewEmail(request.id)
      setEmail(preview)
    } catch (err) {
      setError('Failed to generate email preview')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (type: 'subject' | 'body') => {
    if (!email) return

    const text = type === 'subject' ? email.subject : email.body
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <Card className="relative z-10 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          )}

          {email && !isLoading && (
            <div className="space-y-6">
              {/* To */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">To:</label>
                <p className="mt-1 text-sm">{email.to_email}</p>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Subject:</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('subject')}
                  >
                    {copied === 'subject' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-sm font-medium">{email.subject}</p>
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Body:</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('body')}
                  >
                    {copied === 'body' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {email.body}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.open(
                      `mailto:${email.to_email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`,
                      '_blank'
                    )
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open in Email Client
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

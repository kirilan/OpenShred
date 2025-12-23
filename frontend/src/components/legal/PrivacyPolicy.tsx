import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@example.com'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm text-muted-foreground">OpenShred</p>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: 2025-12-23</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link className="text-primary hover:underline" to="/login">
              Back to sign in
            </Link>
            <Link className="text-primary hover:underline" to="/terms">
              Terms of Service
            </Link>
          </div>
        </header>

        <Card>
          <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Overview</h2>
              <p>
                This Privacy Policy explains how OpenShred (the “Service”) collects, uses, and
                protects information when you authenticate with Google and use the app to scan
                your inbox and manage deletion requests.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Information We Collect</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Account data: your Google account email and OAuth tokens.</li>
                <li>Mailbox data: email metadata and message content used for scans and threads.</li>
                <li>Deletion workflow data: requests, responses, broker entries, and analytics.</li>
                <li>Optional AI settings: your Gemini API key and model selection (if enabled).</li>
                <li>Usage data: timestamps, scan history, and error logs for reliability.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">How We Use Data</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Authenticate you via Google OAuth.</li>
                <li>Scan your inbox for broker communications and responses.</li>
                <li>Generate and send deletion request emails you approve.</li>
                <li>Provide analytics and activity history.</li>
                <li>Improve reliability, security, and support.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Data Sharing</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Google APIs are used for Gmail access and OAuth authentication.</li>
                <li>If AI Assist is enabled, relevant thread content is sent to Gemini.</li>
                <li>We do not sell your data or share it with advertisers.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Security</h2>
              <p>
                OAuth tokens and AI keys are encrypted at rest. Email contents are not written to
                application logs. We apply least-privilege access and secure storage practices.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Retention and Deletion</h2>
              <p>
                We retain data as long as your account is active or as needed to provide the
                Service. You can revoke Google access at any time to stop further data access.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Your Choices</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Review scans and responses before sending any deletion request.</li>
                <li>Disable AI Assist by removing your Gemini API key.</li>
                <li>Revoke Google OAuth access from your Google account settings.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Contact</h2>
              <p>
                For questions or requests, contact us at{' '}
                <a className="text-primary hover:underline" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
                .
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

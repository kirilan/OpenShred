import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@example.com'

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <Seo
        title="OpenShred Terms of Service"
        description="Review the OpenShred terms for using the open-source Gmail data deletion assistant."
        path="/terms"
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm text-muted-foreground">OpenShred</p>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: 2025-12-23</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link className="text-primary hover:underline" to="/login">
              Back to sign in
            </Link>
            <Link className="text-primary hover:underline" to="/privacy">
              Privacy Policy
            </Link>
          </div>
        </header>

        <Card>
          <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Acceptance</h2>
              <p>
                By accessing or using OpenShred (the “Service”), you agree to these Terms. If you
                do not agree, do not use the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">The Service</h2>
              <p>
                OpenShred helps you scan Gmail for data broker communications, generate deletion
                requests, and track broker responses. You remain in control of sending requests.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Your Responsibilities</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Provide accurate information and keep your account secure.</li>
                <li>Use the Service in compliance with applicable laws and Google policies.</li>
                <li>Review generated messages before sending deletion requests.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Third-Party Services</h2>
              <p>
                The Service uses Google APIs for authentication and Gmail access. If AI Assist is
                enabled, content may be sent to Gemini using your API key. Your use of these
                services is subject to their terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Disclaimers</h2>
              <p>
                The Service is provided “as is” without warranties of any kind. We do not guarantee
                that brokers will honor requests or that scans will identify all relevant messages.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, we are not liable for indirect, incidental,
                or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Termination</h2>
              <p>
                You may stop using the Service at any time by revoking Google access. We may
                suspend or terminate access if these Terms are violated.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Changes</h2>
              <p>
                We may update these Terms. Continued use after changes means you accept the
                updated Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Contact</h2>
              <p>
                Questions about these Terms? Contact{' '}
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

from datetime import datetime, timedelta


class EmailTemplates:
    @staticmethod
    def generate_deletion_request_email(
        user_email: str,
        broker_name: str,
        framework: str = "GDPR/CCPA"
    ) -> tuple[str, str]:
        """
        Generate deletion request email

        Returns:
            (subject, body)
        """
        subject = f"Data Deletion Request under {framework}"

        # Calculate deadline (30 days from now)
        deadline = (datetime.now() + timedelta(days=30)).strftime("%B %d, %Y")

        if "GDPR" in framework:
            legal_reference = """
Under Article 17 of the General Data Protection Regulation (GDPR), I have the right to request the erasure of my personal data.
"""
        else:
            legal_reference = """
Under the California Consumer Privacy Act (CCPA), I have the right to request the deletion of my personal information.
"""

        body = f"""Dear {broker_name} Privacy Team,

I am writing to formally request the complete deletion of all my personal data from your systems and databases.

{legal_reference.strip()}

Please delete all information associated with:
- Email: {user_email}
- Any other personal identifiers derived from the above

This request includes, but is not limited to:
- Contact information (email, phone, address)
- Demographic information
- Online identifiers
- Any data obtained from third-party sources
- All derived or inferred data

Please confirm receipt of this request within 5 business days and complete the deletion within 30 days as required by law. I expect confirmation once the deletion is complete.

If you require any additional information to process this request, please contact me at {user_email}.

Please note that I do not consent to any further processing, sharing, or sale of my data, and I expect all third parties with whom you have shared my data to be notified of this deletion request.

Deadline for completion: {deadline}

Thank you for your prompt attention to this matter.

Sincerely,
{user_email}
"""

        return subject, body

    @staticmethod
    def generate_gdpr_request(user_email: str, broker_name: str) -> tuple[str, str]:
        """Generate GDPR-specific deletion request"""
        return EmailTemplates.generate_deletion_request_email(
            user_email,
            broker_name,
            framework="GDPR"
        )

    @staticmethod
    def generate_ccpa_request(user_email: str, broker_name: str) -> tuple[str, str]:
        """Generate CCPA-specific deletion request"""
        return EmailTemplates.generate_deletion_request_email(
            user_email,
            broker_name,
            framework="CCPA"
        )

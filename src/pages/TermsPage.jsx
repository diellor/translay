import { Box, Container, Typography } from '@mui/material';
import Navbar from '../components/Navbar';

export default function TermsPage() {
  return (
      <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
      >
        <Navbar />

        <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
          <Typography
              variant="h3"
              fontWeight={800}
              fontFamily="Inter"
              color="#fff"
              mb={4}
              textAlign="center"
          >
            Terms&nbsp;•&nbsp;Conditions
          </Typography>

          <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: 3,
                boxShadow: 4,
                p: { xs: 3, sm: 5 },
                lineHeight: 1.7,
              }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              1. Introduction
            </Typography>
            <Typography variant="body2" paragraph>
              These Terms govern your use of translay.ai, operated by Monotech based in Kosovo.
              By using our service, you agree to these Terms and our Privacy Policy.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              2. Services Offered
            </Typography>
            <Typography variant="body2" paragraph>
              Translay.ai offers AI-powered PDF translation services. Users can preview translations for free
              and purchase full document translations. No account is required; an email is needed for delivery.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              3. Acceptable Use
            </Typography>
            <Typography variant="body2" paragraph>
              Users must not upload illegal, infringing, or malicious content. Abuse of the free preview or
              system exploitation is prohibited.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              4. Intellectual Property
            </Typography>
            <Typography variant="body2" paragraph>
              You retain ownership of the documents you upload. Monotech holds all rights to the service's
              underlying technology and content.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              5. Payments and Refunds
            </Typography>
            <Typography variant="body2" paragraph>
              Prices are stated at checkout. Payments are processed via Paysera. Refunds are only available for
              defective or missing files, not for stylistic dissatisfaction.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              6. Liability
            </Typography>
            <Typography variant="body2" paragraph>
              Monotech is not liable for indirect damages or translation inaccuracies. Our total liability is
              limited to the amount paid for the service or €50, whichever is lower.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              7. Termination
            </Typography>
            <Typography variant="body2" paragraph>
              We reserve the right to terminate access for violations of these Terms without notice.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              8. Governing Law
            </Typography>
            <Typography variant="body2" paragraph>
              These Terms are governed by the laws of the Republic of Kosovo. Any disputes shall be resolved
              under Kosovo's jurisdiction.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              9. Modifications
            </Typography>
            <Typography variant="body2" paragraph>
              We may update these Terms. Material changes will be announced on our website. Continued use of the
              service constitutes acceptance.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              10. Contact
            </Typography>
            <Typography variant="body2">
              For inquiries, contact us at <a href="mailto:support@translay.ai">support@translay.ai</a>.
              Monotech, Kosovo.
            </Typography>
          </Box>
        </Container>
      </Box>
  );
}

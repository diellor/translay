import { Box, Container, Typography } from '@mui/material';
import Navbar from '../components/Navbar';

export default function PrivacyPage() {
  return (
      <Box
          sx={{
            minHeight : '100vh',
            width     : '100vw',
            overflowX : 'hidden',
            display   : 'flex',
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
            Privacy&nbsp;Policy
          </Typography>

          <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius   : 3,
                boxShadow      : 4,
                p              : { xs: 3, sm: 5 },
                lineHeight     : 1.7,
              }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              1. What We Collect
            </Typography>
            <Typography variant="body2" paragraph>
              We collect the files you upload, the language you choose for translation, your email
              address, and any payment-related information such as transaction identifiers when you
              purchase a full translation.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              2. How We Use Data
            </Typography>
            <Typography variant="body2" paragraph>
              Your documents are processed solely to provide the translation service. Uploaded files
              are stored temporarily on AWS S3 and are automatically deleted after 30 days. We may
              keep minimal metadata (such as email and transaction ID) for troubleshooting and audit
              purposes.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              3. Cookies
            </Typography>
            <Typography variant="body2" paragraph>
              We use a single first-party cookie to remember that you have accepted our Terms and
              Conditions. We do not use third-party tracking cookies.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              4. Your Rights
            </Typography>
            <Typography variant="body2" paragraph>
              You may request access to, correction of, or deletion of your personal data by emailing
              us at <a href="mailto:support@translay.ai">support@translay.ai</a>. We process such
              requests in compliance with GDPR and other applicable laws.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              5. Data Location & Protection
            </Typography>
            <Typography variant="body2" paragraph>
              Your data is stored on secure AWS infrastructure located in the EU. Access is strictly
              limited to authorized personnel and used solely for service operation, troubleshooting,
              or compliance with legal obligations.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              6. Contact
            </Typography>
            <Typography variant="body2">
              For any privacy-related inquiries, please contact us at <a href="mailto:support@translay.ai">support@translay.ai</a>.
              Our legal entity is Monotech, based in Kosovo.
            </Typography>
          </Box>
        </Container>
      </Box>
  );
}

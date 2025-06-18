// src/pages/PrivacyPage.jsx
import { Box, Container, Typography } from '@mui/material';
import Navbar from '../components/Navbar';

export default function PrivacyPage() {
  return (
    <Box
      sx={{
        minHeight : '100vh',
        width     : '100vw',
        overflowX : 'hidden',
        background: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
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
            1. What&nbsp;We&nbsp;Collect
          </Typography>
          <Typography variant="body2" paragraph>
            We collect the files you upload, the language you choose, and basic
            account information such as your email. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            2. How&nbsp;We&nbsp;Use Data
          </Typography>
          <Typography variant="body2" paragraph>
            Your documents are processed solely to provide the translation service and are
            automatically deleted after 30 days. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            3. Cookies
          </Typography>
          <Typography variant="body2" paragraph>
            We use a single first-party cookie to remember that you accepted the Terms. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            4. Your&nbsp;Rights
          </Typography>
          <Typography variant="body2" paragraph>
            You may request deletion of your data at any time by emailing
            support@translay.ai. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            5. Contact
          </Typography>
          <Typography variant="body2">
            Questions? Write to us at support@translay.ai.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

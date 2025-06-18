// src/pages/TermsPage.jsx
import { Box, Container, Typography } from '@mui/material';
import Navbar from '../components/Navbar';

export default function TermsPage() {
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
        {/* hero */}
        <Typography
          variant="h3"
          fontWeight={800}
          fontFamily="Inter"
          color="#fff"
          mb={4}
          textAlign="center"
        >
          Terms&nbsp;&nbsp;•&nbsp;&nbsp;Conditions
        </Typography>

        {/* content card */}
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
            1. Introduction
          </Typography>
          <Typography variant="body2" paragraph>
            These Terms of Service (“Terms”) govern your access to and use of Translay.ai
            (“Service”). By using the Service you agree to be bound by these Terms.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            2. Use of the Service
          </Typography>
          <Typography variant="body2" paragraph>
            You may not misuse the Service or attempt to access it using a method other than
            the interface we provide. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            3. Payments &amp; Refunds
          </Typography>
          <Typography variant="body2" paragraph>
            All prices are shown before VAT. You will be billed when you unlock the full
            translation. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            4. Termination
          </Typography>
          <Typography variant="body2" paragraph>
            We may suspend or terminate your access if you breach these Terms. …
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            5. Governing Law
          </Typography>
          <Typography variant="body2">
            These Terms are governed by the laws of Serbia, without regard to its conflict of
            law principles. …
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

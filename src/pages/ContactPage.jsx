// src/pages/ContactPage.jsx
import { Box, Container, Typography, Link } from '@mui/material';
import Navbar from '../components/Navbar';

export default function ContactPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        background: 'linear-gradient(135deg,#1e3c72 0%,#2a5298 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 12, pb: 8 }}>
        <Typography
          variant="h3"
          fontWeight={800}
          fontFamily="Inter"
          color="#fff"
          mb={4}
          textAlign="center"
        >
          Contact Us
        </Typography>

        <Box
          sx={{
            backgroundColor: '#fff',
            borderRadius: 3,
            boxShadow: 4,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Drop us a line
          </Typography>
          <Typography variant="body1">
            We’re always happy to help. Reach us at
            <br />
            <Link
              href="mailto:support@translay.ai"
              sx={{ fontWeight: 600, color: '#64b5f6' }}
            >
              support@translay.ai
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

// src/pages/AboutPage.jsx
import { Box, Container, Typography } from '@mui/material';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
 <Box
   sx={{
     minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg,#1e3c72 0%,#2a5298 100%)',
     display: 'flex',
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
          About Us
        </Typography>

        {/* content card */}
        <Box
          sx={{
            backgroundColor: '#fff',
            borderRadius: 3,
            boxShadow: 4,
            p: { xs: 3, sm: 5 },
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            We make every PDF speak your language.
          </Typography>
          <Typography variant="body1" paragraph>
            Translay.ai was born from a simple frustration: important research,
            manuals and contracts remain locked behind language barriers and
            clunky file formats. We’re a remote-first team of linguists, machine-learning
            engineers, and product nerds working to change that.
          </Typography>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Instant understanding, zero friction.</strong> We combine
            cutting-edge AI with thoughtful design to turn messy PDFs into
            polished translations—so you can focus on content, not conversion.
          </Typography>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            Meet the Team
          </Typography>
          <Typography variant="body1">
            • Élodie Martin — CEO<br />
            • Dr. Stefan Popović — CTO<br />
            • Aria Chen — Lead Product Designer<br />
            • … and 7 more engineers across 4 time zones.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

import {
  Box, Typography, Button, Stack, Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link as RouterLink } from 'react-router-dom';

export default function AcceptBox({ onAccept }) {
  const features = [
    'Translate up to 50 pages per document',
    'Preserves original layout and formatting',
    'Preview first 5 pages before full translation',
    'Private & secure (EU-hosted)',
    'Files auto-deleted after 30 days',
  ];

  return (
    <>
      <Stack spacing={2} sx={{ width: '100%' }}>
        {features.map((text, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <CheckCircleIcon
              sx={{ fontSize: 20, color: '#1976d2', mt: '2px', mr: 1.5 }}
              aria-hidden="true"
            />
            <Typography
              variant="body2"
              sx={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.5 }}
            >
              {text}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography
          variant="caption"
          sx={{ fontSize: '0.75rem', color: '#666', mb: 1, lineHeight: 1.4 }}
        >
          By using Translay, I accept the&nbsp;
          <Link component={RouterLink} to="/terms" underline="always" sx={{ fontWeight: 600 }}>
            Terms&nbsp;of&nbsp;Service
          </Link>
          &nbsp;and&nbsp;
          <Link component={RouterLink} to="/privacy" underline="always" sx={{ fontWeight: 600 }}>
            Privacy&nbsp;Policy
          </Link>
          .
        </Typography>

        <Button variant="contained" fullWidth onClick={onAccept}
                sx={{ mt:1, textTransform:'uppercase', fontWeight:600,
                      fontSize:'0.9rem', py:'0.75rem' }}>
          I&nbsp;Accept
        </Button>
      </Box>
    </>
  );
}

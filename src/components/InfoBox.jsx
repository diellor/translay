import {
  Box, Typography, Button, Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function InfoBox({ onContinue }) {
  const points = [
    'AI cleans up even the messiest scans',
      'Auto-detects multiple source languages and translates everything into your target language',
    'Human-quality translation in minutes',
    'Private, EU-hosted & auto-deleted',
    'Pay only if you love the preview',
      'Fully Preserve Layout\n' +
      '\n' +
      'Able to Translate Scanned PDF\n' +
      '\n' +
      'Powered by Advanced LLM'
  ];

  return (
    <>
      <Stack spacing={2} sx={{ width:'100%' }}>
        {points.map((txt,i) => (
          <Box key={i} sx={{ display:'flex', alignItems:'flex-start' }}>
            <AccessTimeIcon sx={{ fontSize:20, color:'#1976d2', mt:'2px', mr:1.5 }}/>
            <Typography variant="body2"
                        sx={{ fontSize:'0.95rem', color:'#333', lineHeight:1.5 }}>
              {txt}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Button variant="contained" fullWidth onClick={onContinue}
              sx={{ mt:3, textTransform:'uppercase', fontWeight:600,
                    fontSize:'0.9rem', py:'0.75rem' }}>
        Continue
      </Button>
    </>
  );
}

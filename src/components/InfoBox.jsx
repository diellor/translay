import {
  Box, Typography, Button, Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function InfoBox({ onContinue }) {
  const points = [
    'Preserves original layout and formatting',
    'Professional-grade translation quality',
    'Private and secure — EU-hosted',
    'Preview before you commit',
  ];

  return (
    <>
      <Stack spacing={1.5} sx={{ width:'100%' }}>
        {points.map((txt,i) => (
          <Box key={i} sx={{ display:'flex', alignItems:'center' }}>
            <CheckCircleIcon sx={{ fontSize:18, color:'#1976d2', mr:1.5 }}/>
            <Typography variant="body2"
                        sx={{ fontSize:'0.9rem', color:'#444', lineHeight:1.5 }}>
              {txt}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Button variant="contained" fullWidth onClick={onContinue}
              sx={{ mt:3, textTransform:'none', fontWeight:600,
                    fontSize:'0.9rem', py:1, borderRadius:2 }}>
        Continue
      </Button>
    </>
  );
}

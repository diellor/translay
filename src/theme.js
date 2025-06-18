// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', 'Montserrat', 'sans-serif'].join(','),
  },
});

export default theme;
// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3c72',
    },
    secondary: {
      main: '#64b5f6',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Montserrat', 'sans-serif'].join(','),
  },
});

export default theme;
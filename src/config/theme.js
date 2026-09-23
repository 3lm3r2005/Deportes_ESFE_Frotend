import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: { main: '#1B5E20' },   // verde cancha
    secondary: { main: '#F9A825' }, // dorado
    background: { default: '#F4F6F8', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
});

theme = responsiveFontSizes(theme);

export { theme };
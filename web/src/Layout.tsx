import './Layout.css';
import { Outlet } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { CssBaseline } from '@mui/material';

function Layout() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#282c34',
        paper: '#282c34',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="Layout">
        <Container maxWidth="sm" className="Layout-body">
          <Outlet />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Layout;

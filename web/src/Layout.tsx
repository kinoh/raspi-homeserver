import './Layout.css';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { CssBaseline, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';

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

  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setDrawerOpen(open);
    };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="Layout">
        {location.pathname !== '/' &&
          <Box className="Layout-menuButton" onClick={toggleDrawer(true)}>
            <IconButton>
              <MenuIcon />
            </IconButton>
          </Box>
        }
        <SwipeableDrawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              <ListItem button onClick={() => navigate('/')}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary='Home' />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/player')}>
                <ListItemIcon>
                  <MusicNoteIcon />
                </ListItemIcon>
                <ListItemText primary='Player' />
              </ListItem>
              <ListItem button onClick={() => navigate('/ir')}>
                <ListItemIcon>
                  <SettingsRemoteIcon />
                </ListItemIcon>
                <ListItemText primary='IR' />
              </ListItem>
            </List>
          </Box>
        </SwipeableDrawer>
        <Container maxWidth="sm" className="Layout-body">
          <Outlet />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Layout;

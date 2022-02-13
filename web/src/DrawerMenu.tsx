import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import WebIcon from '@mui/icons-material/Web';

function DrawerMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const externalLinks = useMemo(() => {
    const json = process.env.REACT_APP_EXTERNAL_LINKS;
    if (!json) {
      return {};
    }
    return JSON.parse(json) as {[index: string]: string};
  }, []);

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
    <>
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
            <Divider />
            {Object.keys(externalLinks).map(key =>
              <ListItemButton key={key} component="a" href={externalLinks[key]}>
                <ListItemIcon>
                  <WebIcon />
                </ListItemIcon>
                <ListItemText primary={key} />
              </ListItemButton>
            )}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
}

export default DrawerMenu;

import './Home.css';
import { useNavigate } from "react-router-dom";
import { Grid, IconButton, Stack } from "@mui/material";

import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';

function Home() {
  let navigate = useNavigate();

  return (
    <Stack direction="column" spacing={0} height="100vh" justifyContent="center">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <IconButton color="primary" size="large" onClick={() => navigate('/player')}>
            <MusicNoteIcon sx={{ fontSize: 100 }} />
          </IconButton>
        </Grid>
        <Grid item xs={6}>
          <IconButton color="primary" size="large" onClick={() => navigate('/ir')}>
            <SettingsRemoteIcon sx={{ fontSize: 100 }} />
          </IconButton>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default Home;

import React, { useEffect } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendToMobileIcon from '@mui/icons-material/SendToMobile';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import StopIcon from '@mui/icons-material/Stop';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface PlayerStatus {
    videoPath?: string;
    title?: string;
    volume: number;
    duration?: number;
    paused: boolean;
    timePosition: number;
};

function extractVideoId(path: string): string | null {
  let m = path.match(/(?:v=|\/)([\w\-_]+)$/);
  if (!m) return null;
  return m[1];
}

function callAPI(path: string, method: 'GET' | 'POST', payload: object | null, successCallback: (response: any) => void, errorCallback: (reason: any) => void) {
  const request: RequestInit = {
    method: method,
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (payload !== null) {
    request.body = JSON.stringify(payload);
  }
  fetch(`/api/music${path}`, request).then(response => {
    if (response.status !== 200) {
      throw new Error(`status ${response.status}`);
    }
    return response.json();
  }).then(data => {
    successCallback(data);
  }).catch(e => {
    errorCallback(e);
  });
}

function App() {
  const [logLines, setLogLines] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<PlayerStatus>({
    volume: 80,
    paused: true,
    timePosition: 0,
  });

  const thumbnailUrl = (status.videoPath ? `https://i3.ytimg.com/vi/${extractVideoId(status.videoPath)}/maxresdefault.jpg` : 'data:image/png;base64,Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAADDDgAAww4AAAAAAAAAAAAAJiAdAA==');
  const progress = (status.duration ? status.timePosition / status.duration * 100 : null);

  const writeLog = React.useCallback((text: string) => {
    const t = new Date();
    setLogLines([`[${t.toLocaleDateString()} ${t.toLocaleTimeString()}] ${text}`, ...logLines]);
  }, [logLines, setLogLines]);

  const updateStatus = React.useCallback(() => {
    callAPI('/status', 'GET', null, (response) => {
      writeLog(`/status ok`);
      setStatus({
        videoPath: response.path,
        title: response.title,
        volume: response.volume,
        duration: response.duration,
        paused: response.paused,
        timePosition: response.t,
      });
    }, (error) => {
      writeLog(`/status error: ${error}`);
    });
  }, [writeLog]);

  const handleLoadClick = () => {
    navigator.clipboard.readText().then(text => {
      callAPI('/play', 'POST', {url: text}, (response) => {
        writeLog(`/play ${response.ok ? 'ok' : 'failed'}`);
        updateStatus();
      }, (error) => {
        writeLog(`/play error: ${error}`);
      });
    });
  };

  const handlePlayClick = () => {
    navigator.clipboard.readText().then(text => {
      callAPI('/pause', 'POST', null, (response) => {
        writeLog(`/pause ${response.ok ? 'ok' : 'failed'}`);
        updateStatus();
      }, (error) => {
        writeLog(`/pause error: ${error}`);
      });
    });
  };

  const handleStopClick = () => {
    navigator.clipboard.readText().then(text => {
      callAPI('/stop', 'POST', null, (response) => {
        writeLog(`/stop ${response.ok ? 'ok' : 'failed'}`);
        updateStatus();
      }, (error) => {
        writeLog(`/stop error: ${error}`);
      });
    });
  };

  const handleSkipPreviousClick = () => {
    callAPI('/prev', 'POST', null, (response) => {
      writeLog(`/prev ${response.ok ? 'ok' : 'failed'}`);
      updateStatus();
    }, (error) => {
      writeLog(`/prev error: ${error}`);
    });
  };

  const handleSkipNextClick = () => {
    callAPI('/next', 'POST', null, (response) => {
      writeLog(`/next ${response.ok ? 'ok' : 'failed'}`);
      updateStatus();
    }, (error) => {
      writeLog(`/next error: ${error}`);
    });
  };

  const handleShuffleClick = () => {
    callAPI('/shuffle', 'POST', null, (response) => {
      writeLog(`/shuffle ${response.ok ? 'ok' : 'failed'}`);
      updateStatus();
    }, (error) => {
      writeLog(`/shuffle error: ${error}`);
    });
  };

  const handleVolumeChange = (event: Event, value: number | number[]) => {
    callAPI('/volume', 'POST', {volume: value as number}, (response) => {
      writeLog(`/volume ${response.ok ? 'ok' : 'failed'}`);
      updateStatus();
    }, (error) => {
      writeLog(`/volume error: ${error}`);
    });
  };

  useEffect(() => {
    const id = setInterval(() => {
      updateStatus();
    }, 2000);
    return () => {
      clearInterval(id)
    };
  }, [updateStatus]);

  return (
    <Box className="App">
      <Container maxWidth="sm" className="App-body">
        <Box className="App-log" position="fixed">
          <Stack direction="column" spacing={0} height="0" maxHeight="0">
            {logLines.map((line, i) =>
              <Box key={i}>
                {line}
              </Box>
            )}
          </Stack>
        </Box>
        <Stack direction="column" spacing={0} height="100vh" justifyContent="center" position="relative" zIndex={1}>
          <img src={thumbnailUrl} className="App-thumbnail" alt="thumbnail" />
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={progress ?? 0} />
          </Box>
          <p>
            {status.title ?? '\u200b'}
          </p>
          <Stack direction="row" spacing={0} justifyContent="center" alignItems="center" flexWrap="wrap">
            <IconButton color="primary" size="large" disabled={!!status.videoPath} onClick={handleLoadClick}>
              <SendToMobileIcon />
            </IconButton>
            <IconButton color="primary" size="large" disabled={!status.videoPath} onClick={handlePlayClick}>
              {status.paused
                ? <PlayArrowIcon />
                : <PauseIcon />
              }
            </IconButton>
            <IconButton color="primary" size="large" disabled={!status.videoPath} onClick={handleStopClick}>
              <StopIcon />
            </IconButton>
            <IconButton color="primary" size="large" disabled={!status.videoPath} onClick={handleSkipPreviousClick}>
              <SkipPreviousIcon />
            </IconButton>
            <IconButton color="primary" size="large" disabled={!status.videoPath} onClick={handleSkipNextClick}>
              <SkipNextIcon />
            </IconButton>
            <IconButton color="primary" size="large" disabled={!status.videoPath} onClick={handleShuffleClick}>
              <ShuffleIcon />
            </IconButton>
            <Stack direction="row" spacing={0}>
              <VolumeDownIcon sx={{ m: 1.5 }} />
              <Box className="App-volumeSlider" display="flex" justifyContent="center" alignItems="center">
                <Slider aria-label="Volume" value={status.volume} onChange={handleVolumeChange} />
              </Box>
              <VolumeUpIcon sx={{ m: 1.5 }} />
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;

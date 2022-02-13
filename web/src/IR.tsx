import './IR.css';
import React, { useCallback, useEffect } from 'react';
import { Alert, FormControlLabel, Grid, Radio, RadioGroup, Slider, Snackbar, Stack } from "@mui/material";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import WaterIcon from '@mui/icons-material/Water';

interface IRStatus {
  power_on: boolean;
  mode: 'heater' | 'cooler' | 'dehumidifier';
  temperature: number;
  output: number;
  direction: number;
};

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
  fetch(`/api/ir${path}`, request).then(response => {
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

function IR() {
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<string>('N/A');
  const [status, setStatus] = React.useState<IRStatus>({
    power_on: true,
    mode: 'heater',
    temperature: 19,
    output: 0,
    direction: 4,
  });
  const [lastTimeout, setLastTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const showError = (message: string) => {
    setSnackMessage(message);
    setSnackOpen(true);
  }

  const temperatureMarks = [
    {
      value: 16,
      label: '16℃',
    },
    {
      value: 20,
      label: '20℃',
    },
    {
      value: 30,
      label: '30℃',
    }
  ];
  const outputMarks = [
    {
      value: 0,
      label: 'Auto',
    },
    {
      value: 1,
      label: '1',
    },
    {
      value: 3,
      label: '3',
    }
  ];
  const directionMarks = [
    {
      value: 0,
      label: 'Auto',
    },
    {
      value: 1,
      label: '1',
    },
    {
      value: 4,
      label: '4',
    },
    {
      value: 5,
      label: 'Swing',
    }
  ];

  const statusRef = React.useRef<() => IRStatus | null>(() => null);
  statusRef.current = () => status;
  const send = useCallback(() => {
    const currentStatus = statusRef.current();
    if (currentStatus === null) {
      showError('status inaccessible');
      return;
    }
    callAPI('/status', 'POST', {
      ...currentStatus,
      dehumidifier_level: (currentStatus.temperature < 20 ? 2 : (currentStatus.temperature < 25 ? 1 : 0)),
    }, (response) => {
      const d = currentStatus as {[index: string]: any}
      if (Object.keys(d).some((key) => d[key] !== response[key])) {
        showError('status mismatch');
      }
    }, (error) => {
      showError(error.toString());
    });
  }, [statusRef]);

  const reserveSend = useCallback(() => {
    if (lastTimeout !== null) {
      clearTimeout(lastTimeout);
    }
    const timeout = setTimeout(send, 400);
    setLastTimeout(timeout);
  }, [lastTimeout, send]);

  const handlePowerChange = useCallback((event: React.ChangeEvent, value: string) => {
    setStatus({
      ...status,
      power_on: value === 'on',
    });
    reserveSend();
  }, [status, reserveSend]);
  const handleModeChange = useCallback((event: React.ChangeEvent, value: string) => {
    if (!['heater', 'cooler', 'dehumidifier'].includes(value)) {
      throw new Error('invalid mode value');
    }
    setStatus({
      ...status,
      mode: value as any,
    });
    reserveSend();
  }, [status, reserveSend]);
  const handleTemperatureChange = useCallback((event: Event, value: number | number[]) => {
    setStatus({
      ...status,
      temperature: value as number,
    });
    reserveSend();
  }, [status, reserveSend]);
  const handleOutputChange = useCallback((event: Event, value: number | number[]) => {
    setStatus({
      ...status,
      output: value as number,
    });
    reserveSend();
  }, [status, reserveSend]);
  const handleDirectionChange = useCallback((event: Event, value: number | number[]) => {
    setStatus({
      ...status,
      direction: value as number,
    });
    reserveSend();
  }, [status, reserveSend]);

  const ModeIcon = {
    'heater': LocalFireDepartmentIcon,
    'cooler': AcUnitIcon,
    'dehumidifier': WaterIcon,
  }[status.mode];
  const modeColor = (mode: 'heater' | 'cooler' | 'dehumidifier') => {
    switch (mode) {
      case 'heater':
        return 'error';
      case 'cooler':
        return 'info';
      case 'dehumidifier':
        return 'primary';
    }
  };

  const temperatureColor = (mode: string, value: number) => {
    switch (mode) {
      case 'heater':
        return value <= 23 ? 'warning' : 'error';
      case 'cooler':
      case 'dehumidifier':
        return value >= 25 ? 'info' : 'secondary';
    }
  };
  const temperatureText = (value: number): string => {
    return `${value}℃`;
  };

  useEffect(() => {
    callAPI('/status', 'GET', null, (response) => {
      setStatus({
        power_on: response['power_on'],
        mode: response['mode'],
        temperature: response['temperature'],
        output: response['output'],
        direction: response['direction'],
      });
    }, (error) => {
      showError(error.toString());
    });
  }, []);

  return (
    <>
      <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        open={snackOpen}
        onClose={() => setSnackOpen(false)}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="error" sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>

      <Stack direction="column" spacing={0} height="100vh" justifyContent="center">
        <Grid container columnSpacing={2} rowSpacing={10}>
          <Grid item xs={6}>
            <Stack spacing={2} direction="column" alignItems="center">
              <PowerSettingsNewIcon color={status.power_on ? 'success' : 'disabled'} sx={{ fontSize: 100 }} />
              <RadioGroup row value={status.power_on ? 'on' : 'off'} onChange={handlePowerChange}>
                <FormControlLabel value="on" control={<Radio />} label="On" labelPlacement="bottom" />
                <FormControlLabel value="off" control={<Radio />} label="Off" labelPlacement="bottom" />
              </RadioGroup>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={2} direction="column" alignItems="center">
              <ModeIcon color={status.power_on ? modeColor(status.mode) : 'disabled'} sx={{ fontSize: 100 }} />
              <RadioGroup row value={status.mode} sx={{width: '90%', justifyContent: 'space-around'}} onChange={handleModeChange}>
                <FormControlLabel value="heater" control={<Radio />} label="Heater" labelPlacement="bottom" sx={{margin: '0'}} />
                <FormControlLabel value="cooler" control={<Radio />} label="Cooler" labelPlacement="bottom" sx={{margin: '0'}} />
                <FormControlLabel value="dehumidifier" control={<Radio />} label="Dehum" labelPlacement="bottom" sx={{margin: '0'}} />
              </RadioGroup>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={2} direction="column" alignItems="center">
              <ThermostatIcon color={status.power_on ? temperatureColor(status.mode, status.temperature) : 'disabled'} sx={{ fontSize: 100 }} />
              <Slider
                value={status.temperature}
                min={16}
                max={30}
                getAriaValueText={temperatureText}
                valueLabelFormat={temperatureText}
                step={1}
                valueLabelDisplay="on"
                marks={temperatureMarks}
                sx={{width: '80%'}}
                onChange={handleTemperatureChange}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={2} direction="column" alignItems="center">
              <AirIcon color={status.power_on ? 'primary' : 'disabled'} sx={{ fontSize: 100 }} />
              <Slider
                value={status.output}
                min={0}
                max={3}
                getAriaValueText={(x) => x.toString()}
                step={1}
                valueLabelDisplay="auto"
                marks={outputMarks}
                sx={{width: '80%'}}
                onChange={handleOutputChange}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={2} direction="column" alignItems="center">
              <SouthEastIcon color={status.power_on ? 'primary' : 'disabled'}   sx={{ fontSize: 100 }} />
              <Slider
                value={status.direction}
                min={0}
                max={5}
                getAriaValueText={(x) => x.toString()}
                step={1}
                valueLabelDisplay="auto"
                marks={directionMarks}
                sx={{width: '80%'}}
                onChange={handleDirectionChange}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

export default IR;

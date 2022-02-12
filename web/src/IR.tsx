import './IR.css';
import React from 'react';
import { FormControlLabel, Grid, Radio, RadioGroup, Slider, Stack } from "@mui/material";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import WaterIcon from '@mui/icons-material/Water';

interface IRStatus {
  power: boolean;
  mode: 'heater' | 'cooler' | 'dehumidifier';
  temperature: number;
  output: number;
  direction: number;
};

function IR() {
  const [status, setStatus] = React.useState<IRStatus>({
    power: true,
    mode: 'heater',
    temperature: 19,
    output: 0,
    direction: 4,
  });

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

  const handlePowerChange = (event: React.ChangeEvent, value: string) => {
    setStatus({
      ...status,
      power: value === 'on',
    });
  }
  const handleModeChange = (event: React.ChangeEvent, value: string) => {
    if (!['heater', 'cooler', 'dehumidifier'].includes(value)) {
      throw new Error('invalid mode value');
    }
    setStatus({
      ...status,
      mode: value as any,
    });
  }
  const handleTemperatureChange = (event: Event, value: number | number[]) => {
    setStatus({
      ...status,
      temperature: value as number,
    });
  }
  const handleOutputChange = (event: Event, value: number | number[]) => {
    setStatus({
      ...status,
      output: value as number,
    });
  }
  const handleDirectionChange = (event: Event, value: number | number[]) => {
    setStatus({
      ...status,
      direction: value as number,
    });
  }

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
  }

  const temperatureColor = (mode: string, value: number) => {
    switch (mode) {
      case 'heater':
        return value <= 23 ? 'warning' : 'error';
      case 'cooler':
      case 'dehumidifier':
        return value >= 25 ? 'info' : 'secondary';
    }
  }
  const temperatureText = (value: number): string => {
    return `${value}℃`;
  }

  return (
    <Stack direction="column" spacing={0} height="100vh" justifyContent="center">
      <Grid container columnSpacing={2} rowSpacing={10}>
        <Grid item xs={6}>
          <Stack spacing={2} direction="column" alignItems="center">
            <PowerSettingsNewIcon color={status.power ? 'success' : 'disabled'} sx={{ fontSize: 100 }} />
            <RadioGroup row defaultValue={status.power ? 'on' : 'off'} onChange={handlePowerChange}>
              <FormControlLabel value="on" control={<Radio />} label="On" labelPlacement="bottom" />
              <FormControlLabel value="off" control={<Radio />} label="Off" labelPlacement="bottom" />
            </RadioGroup>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack spacing={2} direction="column" alignItems="center">
            <ModeIcon color={status.power ? modeColor(status.mode) : 'disabled'} sx={{ fontSize: 100 }} />
            <RadioGroup row defaultValue={status.mode} sx={{width: '90%', justifyContent: 'space-around'}} onChange={handleModeChange}>
              <FormControlLabel value="heater" control={<Radio />} label="Heater" labelPlacement="bottom" sx={{margin: '0'}} />
              <FormControlLabel value="cooler" control={<Radio />} label="Cooler" labelPlacement="bottom" sx={{margin: '0'}} />
              <FormControlLabel value="dehumidifier" control={<Radio />} label="Dehum" labelPlacement="bottom" sx={{margin: '0'}} />
            </RadioGroup>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack spacing={2} direction="column" alignItems="center">
            <ThermostatIcon color={status.power ? temperatureColor(status.mode, status.temperature) : 'disabled'} sx={{ fontSize: 100 }} />
            <Slider
              defaultValue={status.temperature}
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
            <AirIcon color={status.power ? 'primary' : 'disabled'} sx={{ fontSize: 100 }} />
            <Slider
              defaultValue={status.output}
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
            <SouthEastIcon color={status.power ? 'primary' : 'disabled'}   sx={{ fontSize: 100 }} />
            <Slider
              defaultValue={status.direction}
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
  );
}

export default IR;

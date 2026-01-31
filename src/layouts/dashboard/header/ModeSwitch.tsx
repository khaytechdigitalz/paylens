import { useState, useEffect } from 'react';
// @mui
import { Stack, Switch, Typography, Box, Tooltip, alpha, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import { useSnackbar } from '../../../components/snackbar';
import Iconify from '../../../components/iconify';
// utils
import axios from '../../../utils/axios';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 40,
  height: 22,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.MuiChecked': {
      transform: 'translateX(18px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.success.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 18,
    height: 18,
    borderRadius: 12,
  },
  '& .MuiSwitch-track': {
    borderRadius: 11,
    opacity: 1,
    backgroundColor: theme.palette.error.main,
  },
}));

// ----------------------------------------------------------------------

export default function ModeSwitch() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  // local state initialized based on user context if available
  const [isLive, setIsLive] = useState(user?.mode === 'live');
  const [loading, setLoading] = useState(false);

  // Sync local state with AuthContext on refresh or user change
  useEffect(() => {
    if (user?.mode) {
      setIsLive(user.mode === 'live');
    }
  }, [user?.mode]);

  const handleToggleMode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetMode = event.target.checked ? 'live' : 'test';


    try {
      setLoading(true);

      const response = await axios.post('/update-mode', {
        mode: targetMode,
      });

      const updatedMode = response.data?.current_mode || response.data?.data?.current_mode;

      if (updatedMode) {
        setIsLive(updatedMode === 'live');
        enqueueSnackbar(`Environment is now ${updatedMode.toUpperCase()}`, { variant: 'success' });

        // Note: You might want to refresh the page here to force all data-fetching hooks
        // to re-run with the new mode headers/params.
        window.location.reload();
      }
    } catch (error) {
      console.error('Mode Update Error:', error);
      enqueueSnackbar('Failed to update environment mode', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isLive ? 'Active: LIVE Mode' : 'Active: TEST Mode'}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: 1.5,
          bgcolor: (theme) => alpha(theme.palette[isLive ? 'success' : 'error'].main, 0.08),
          border: (theme) =>
            `1px solid ${alpha(theme.palette[isLive ? 'success' : 'error'].main, 0.2)}`,
          opacity: loading ? 0.7 : 1,
          transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <CircularProgress
              size={12}
              thickness={6}
              color="inherit"
              sx={{ color: isLive ? 'success.main' : 'error.main' }}
            />
          ) : (
            <>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isLive ? 'success.main' : 'error.main',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isLive ? 'success.main' : 'error.main',
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.8 },
                    '100%': { transform: 'scale(3)', opacity: 0 },
                  },
                }}
              />
            </>
          )}
        </Box>

        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            color: isLive ? 'success.main' : 'error.main',
            minWidth: 32,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {isLive ? 'Live' : 'Test'}
        </Typography>

        <StyledSwitch checked={isLive} onChange={handleToggleMode} disabled={loading} />
      </Stack>
    </Tooltip>
  );
}

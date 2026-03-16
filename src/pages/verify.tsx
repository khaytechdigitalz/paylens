/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { Box, Stack, Typography, CircularProgress, alpha, useTheme } from '@mui/material';
// components
import Iconify from '../components/iconify';
import { useSnackbar } from '../components/snackbar';
// utils
import axios from '../utils/axios';
import GuestGuard from '../auth/GuestGuard';

// ----------------------------------------------------------------------

export default function VerifyAccountPage() {
  const { query, push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account, please wait...');

  const token = query.token as string;

  const handleVerify = useCallback(async () => {
    if (!token) return;

    try {
      // Call the endpoint: {{baseurl}}/auth/verify/{token}
      const response = await axios.get(`/auth/verify/${token}`);

      setStatus('success');
      setMessage(response.data.message || 'Account verified successfully!');
      enqueueSnackbar(response.data.message || 'Verification successful!', { variant: 'success' });

      // Redirect to /login after 3 seconds
      setTimeout(() => {
        push('/login');
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || 'Verification link is invalid or has expired.');
      enqueueSnackbar(error.message || 'Verification failed', { variant: 'error' });
    }
  }, [token, enqueueSnackbar, push]);

  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token, handleVerify]);

  return (
    <>
      <Head>
        <title> Account Verification | CredDot</title>
      </Head>

      <GuestGuard>
        <Box
          sx={{
            py: 12,
            maxWidth: 480,
            mx: 'auto',
            textAlign: 'center',
            px: 3,
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Status Icon Decoration */}
            <Box
              sx={{
                width: 120,
                height: 120,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color:
                  status === 'loading'
                    ? 'primary.main'
                    : status === 'success'
                    ? 'success.main'
                    : 'error.main',
                bgcolor: (theme) =>
                  alpha(
                    status === 'loading'
                      ? theme.palette.primary.main
                      : status === 'success'
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    0.08
                  ),
              }}
            >
              {status === 'loading' ? (
                <CircularProgress color="inherit" size={60} thickness={2} />
              ) : (
                <Iconify
                  icon={
                    status === 'success'
                      ? 'solar:check-circle-bold-duotone'
                      : 'solar:danger-bold-duotone'
                  }
                  width={80}
                />
              )}
            </Box>

            <Stack spacing={1}>
              <Typography variant="h3">
                {status === 'loading' && 'Authenticating...'}
                {status === 'success' && 'Verified!'}
                {status === 'error' && 'Failed'}
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>{message}</Typography>
            </Stack>

            {status === 'success' && (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                Redirecting you to the login page in a few seconds...
              </Typography>
            )}

            {status === 'error' && (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Typography variant="body2">Need help?</Typography>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => push('/contact-support')}
                >
                  Contact Support
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </GuestGuard>
    </>
  );
}

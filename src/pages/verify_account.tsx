/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { Box, Stack, Typography, CircularProgress, alpha, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../components/iconify';
import Logo from '../components/logo';

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

  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = query.token as string;

  const handleVerify = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`/auth/verify/${token}`);
      setStatus('success');
      setMessage(response.data.message || 'OTP Sent');
      enqueueSnackbar('Please verify account using the OTP sent to your mail!', {
        variant: 'success',
      });
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Verification link is invalid or has expired.');
      enqueueSnackbar(error.message || 'Verification failed', { variant: 'error' });
    }
  }, [token, enqueueSnackbar]);

  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token, handleVerify]);

  const handleOtpSubmit = async () => {
    if (otp.length < 6) {
      enqueueSnackbar('Please enter a valid 6-digit OTP', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submitting to the current URL logic: /auth/verify/{token} with OTP body
      const response = await axios.post(`/auth/verify/${token}`, { otp });

      enqueueSnackbar(response.data.message || 'Verification Successful!', { variant: 'success' });

      // Final Redirect to login/dashboard
      setTimeout(() => {
        push('/login');
      }, 2000);
    } catch (error) {
      enqueueSnackbar(error.message || 'Invalid OTP. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title> Account Verification | CredDot</title>
      </Head>

      <GuestGuard>
        <Box sx={{ py: 12, maxWidth: 480, mx: 'auto', textAlign: 'center', px: 3 }}>
          <Logo sx={{ width: 94, height: 94, mb: 2 }} />

          <Stack spacing={4} alignItems="center">
            {/* Status Icon Decoration */}
            <Box
              sx={{
                width: 50,
                height: 50,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
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
                      ? 'solar:shield-check-bold-duotone'
                      : 'solar:danger-bold-duotone'
                  }
                  width={80}
                />
              )}
            </Box>

            <Stack spacing={1}>
              <Typography variant="h3">
                {status === 'loading' && 'Checking Link...'}
                {status === 'success' && 'Verify Your Email'}
                {status === 'error' && 'Link Error'}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>{message}</Typography>
            </Stack>

            {status === 'success' && (
              <Stack spacing={3} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  name="otp"
                  label="Enter 6-Digit OTP"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      letterSpacing: '12px',
                      fontSize: '1.8rem',
                      fontWeight: '800',
                    },
                  }}
                  helperText="Check your email for the verification code"
                />

                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  onClick={handleOtpSubmit}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
                >
                  Verify Account
                </LoadingButton>
              </Stack>
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

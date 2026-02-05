/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import * as Yup from 'yup';
import Head from 'next/head';
import { useRouter } from 'next/router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Stack,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../components/iconify';
import { useSnackbar } from '../components/snackbar';
import FormProvider, { RHFTextField } from '../components/hook-form';
// utils
import axios from '../utils/axios';
import GuestGuard from '../auth/GuestGuard';

// ----------------------------------------------------------------------

type Step = 'EMAIL_REQUEST' | 'OTP_VERIFY' | 'RESET_PASSWORD';

type FormValuesProps = {
  email: string;
  otp: string;
  password?: string;
  confirmPassword?: string;
  afterSubmit?: string;
};

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState<Step>('EMAIL_REQUEST');
  const [showPassword, setShowPassword] = useState(false);

  // Validation Schemas
  const EmailSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const OtpSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required').length(6, 'OTP must be 6 characters'),
  });

  const ResetSchema = Yup.object().shape({
    password: Yup.string().required('Password is required').min(8, 'Password is too short'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(
      step === 'EMAIL_REQUEST' ? EmailSchema : step === 'OTP_VERIFY' ? OtpSchema : ResetSchema
    ),
    defaultValues: { email: '', otp: '', password: '', confirmPassword: '' },
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (step === 'EMAIL_REQUEST') {
        await axios.post('/auth/forgotpassword', { email: data.email });
        enqueueSnackbar('OTP sent to your email');
        setStep('OTP_VERIFY');
      } else if (step === 'OTP_VERIFY') {
        await axios.post('/auth/email/verify', {
          email: data.email,
          otp: data.otp,
        });
        enqueueSnackbar('OTP Verified', { variant: 'success' });
        setStep('RESET_PASSWORD');
      } else if (step === 'RESET_PASSWORD') {
        await axios.post('/auth/resetpassword', {
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
          otp: data.otp,
        });
        enqueueSnackbar('Password reset successful!', { variant: 'success' });
        push('/login');
      }
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((messages: any) => {
          enqueueSnackbar(messages[0], { variant: 'error' });
        });
      }
      setError('afterSubmit', { ...error, message: error.message || 'Action failed' });
    }
  };

  return (
    <>
      <Head>
        <title> Forgot Password | CredDot</title>
      </Head>

      <GuestGuard>
        <br />
        <br />
        <br />
        <Box sx={{ maxWidth: 480, mx: 'auto' }}>
          {/* Header & Icon Illustration */}
          <Stack spacing={2} sx={{ mb: 5, textAlign: 'center', alignItems: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                mb: 2,
              }}
            >
              <Iconify
                icon={
                  step === 'EMAIL_REQUEST'
                    ? 'solar:lock-password-bold-duotone'
                    : step === 'OTP_VERIFY'
                    ? 'solar:shield-check-bold-duotone'
                    : 'solar:key-bold-duotone'
                }
                width={44}
              />
            </Box>

            <Typography variant="h3" gutterBottom>
              {step === 'EMAIL_REQUEST' && 'Forgot Password?'}
              {step === 'OTP_VERIFY' && 'Verification'}
              {step === 'RESET_PASSWORD' && 'New Password'}
            </Typography>

            <Typography sx={{ color: 'text.secondary', px: 2 }}>
              {step === 'EMAIL_REQUEST' &&
                'Enter your registered email and we will send a 6-digit reset code.'}
              {step === 'OTP_VERIFY' && (
                <>
                  A code has been sent to{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {getValues('email')}
                  </Box>
                </>
              )}
              {step === 'RESET_PASSWORD' && 'Create a strong password you haven’t used before.'}
            </Typography>
          </Stack>

          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

              {/* STEP 1: EMAIL */}
              {step === 'EMAIL_REQUEST' && (
                <RHFTextField
                  name="email"
                  label="Email address"
                  placeholder="example@gmail.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:email-outline" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {/* STEP 2: OTP */}
              {step === 'OTP_VERIFY' && (
                <RHFTextField
                  name="otp"
                  label="6-Digit OTP"
                  placeholder="000000"
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      letterSpacing: '8px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                    },
                  }}
                />
              )}

              {/* STEP 3: RESET */}
              {step === 'RESET_PASSWORD' && (
                <>
                  <RHFTextField
                    name="password"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <RHFTextField
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                  />
                </>
              )}

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: (theme) => theme.customShadows?.primary || 'none',
                }}
              >
                {step === 'EMAIL_REQUEST' && 'Send Reset Code'}
                {step === 'OTP_VERIFY' && 'Verify and Continue'}
                {step === 'RESET_PASSWORD' && 'Update Password'}
              </LoadingButton>

              <Stack direction="row" justifyContent="center">
                <Link
                  onClick={() =>
                    step === 'EMAIL_REQUEST' ? push('/login') : setStep('EMAIL_REQUEST')
                  }
                  variant="subtitle2"
                  sx={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'text.primary',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <Iconify icon="eva:chevron-left-fill" width={16} />
                  {step === 'EMAIL_REQUEST' ? 'Return to login' : 'Back to email'}
                </Link>
              </Stack>
            </Stack>
          </FormProvider>
        </Box>
      </GuestGuard>
    </>
  );
}

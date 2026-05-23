/* eslint-disable @typescript-eslint/no-shadow */
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
  Container,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField, RHFCheckbox } from '../../components/hook-form';
import GuestGuard from '../../auth/GuestGuard';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  otp?: string;
  remember?: boolean;
  afterSubmit?: string;
};

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAuthContext();
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Workflow Phase Controller
  const [is2faStep, setIs2faStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic conditional validation schema
  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    otp: is2faStep
      ? Yup.string()
          .required('OTP is required')
          .matches(/^\d+$/, 'OTP must be numerical values only')
      : Yup.string().notRequired(),
  });

  const defaultValues = {
    email: '',
    password: '',
    otp: '',
    remember: true,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = methods;

  // Unified submission handling block
  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (!is2faStep) {
        // STEP 1: Core credentials processing context phase
        const result = (await login(data.email, data.password, data.otp || '')) as
          | { requires_2fa?: boolean; message?: string }
          | undefined;

        if (result?.requires_2fa) {
          enqueueSnackbar(result?.message || 'Verification token sent to your email.', {
            variant: 'info',
          });
          setIs2faStep(true);
        } else {
          enqueueSnackbar(result?.message || 'Access Granted', { variant: 'success' });
        }
      } else {
        // STEP 2: Secure Two-Factor OTP authentication step injection
        // Passing the autofilled email and gathered otp token downward to the unified login handler
       const result = (await login(
         data.email || '',
         data.password || '',
         data.otp || '' // Forces an empty string fallback if undefined
       )) as { requires_2fa?: boolean; message?: string } | undefined;

        enqueueSnackbar(result?.message || 'Access Granted Securely', { variant: 'success' });
      }
    } catch (error: any) {
      console.error(error);

      // Keep form tracking state valid on partial 2FA failure resets
      if (!is2faStep) {
        reset();
      }

      const apiErrorMessage =
        error?.response?.data?.message || error?.message || 'Verification failed. Please retry.';

      setError('afterSubmit', {
        ...error,
        message: apiErrorMessage,
      });

      enqueueSnackbar(apiErrorMessage, { variant: 'error' });
    }
  };

  return (
    <>
      <Head>
        <title>{is2faStep ? 'Verify Identity' : 'Secure Login'} | CredDot</title>
      </Head>

      <GuestGuard>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 2% 10%, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, transparent 40%), 
                        radial-gradient(circle at 98% 90%, ${alpha(
                          theme.palette.primary.main,
                          0.05
                        )} 0%, transparent 40%)`,
          }}
        >
          <Container maxWidth="sm">
            <Box
              sx={{
                px: { xs: 3, md: 6 },
                py: { xs: 5, md: 8 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: (theme) =>
                  `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.12)}`,
                border: `1px solid ${theme.palette.divider}`,
                textAlign: 'center',
              }}
            >
              {/* BRAND HEADER MODULE LOGIC */}
              <Stack spacing={2} sx={{ mb: 5, alignItems: 'center' }}>
                <Logo sx={{ width: 64, height: 64, mb: 1 }} />

                <Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
                    {is2faStep ? 'Verify OTP' : 'Sign In'}
                  </Typography>

                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Typography variant="body2" color="text.secondary">
                      {is2faStep
                        ? `Please enter the security token sent to: ${getValues('email')}`
                        : "Don't have an account?"}
                    </Typography>

                    {!is2faStep && (
                      <Link
                        onClick={() => push('/register')}
                        variant="subtitle2"
                        sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'none' }}
                      >
                        Get Started
                      </Link>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* UNIFIED HOOK FORM MATRIX HANDLER */}
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  {!!errors.afterSubmit && (
                    <Alert severity="error" sx={{ textAlign: 'left' }}>
                      {errors.afterSubmit.message}
                    </Alert>
                  )}

                  {/* CONDITION 1: Traditional Credentials Screen */}
                  {!is2faStep ? (
                    <>
                      <RHFTextField
                        name="email"
                        label="Business Email"
                        placeholder="name@company.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify
                                icon="solar:letter-bold-duotone"
                                sx={{ color: 'text.disabled' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <RHFTextField
                        name="password"
                        label="Security Password"
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify
                                icon="solar:lock-password-bold-duotone"
                                sx={{ color: 'text.disabled' }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                <Iconify
                                  icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <RHFCheckbox name="remember" label="Trust this device" />
                        <Link
                          onClick={() => push('/forgotpassword')}
                          variant="subtitle2"
                          sx={{
                            cursor: 'pointer',
                            color: 'text.secondary',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          Recovery Access
                        </Link>
                      </Stack>
                    </>
                  ) : (
                    /* CONDITION 2: Clear OTP Layer (Hidden email fields but preserved inside React Hook Form) */
                    <RHFTextField
                        name="otp"
                        label="Secure verification code"
                        placeholder="Enter numerical OTP token"
                        autoFocus
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify
                                icon="solar:shield-keyhole-bold-duotone"
                                sx={{ color: 'text.disabled' }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                <Iconify
                                  icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                  )}

                  <LoadingButton
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                    sx={{
                      py: 1.8,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      '&:hover': { bgcolor: 'grey.800' },
                      boxShadow: (theme) =>
                        `0 8px 16px 0 ${alpha(theme.palette.common.black, 0.24)}`,
                    }}
                  >
                    {is2faStep ? 'Authorize OTP Validation' : 'Authorize Login'}
                  </LoadingButton>
                </Stack>
              </FormProvider>

              <Typography
                variant="caption"
                sx={{ mt: 4, display: 'block', color: 'text.disabled', px: 2 }}
              >
                Protecting your data is our priority. By continuing, you agree to our{' '}
                <Link underline="hover" color="text.primary" sx={{ cursor: 'pointer' }}>
                  Security Protocol
                </Link>
                .
              </Typography>
            </Box>
          </Container>
        </Box>
      </GuestGuard>
    </>
  );
}

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
import Logo from '../../components/logo'; // Replaced Iconify with Logo
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField, RHFCheckbox } from '../../components/hook-form';
import GuestGuard from '../../auth/GuestGuard';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  remember?: boolean;
  afterSubmit?: string;
};

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAuthContext();
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
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
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await login(data.email, data.password);
      enqueueSnackbar('Access Granted', { variant: 'success' });
    } catch (error) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message || 'Verification failed. Please check your credentials.',
      });
    }
  };

  return (
    <>
      <Head>
        <title> Secure Login | CredDot</title>
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
              {/* Logo & Badge */}
              <Stack spacing={2} sx={{ mb: 5, alignItems: 'center' }}>
                <Logo sx={{ width: 64, height: 64, mb: 1 }} />

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.dark',
                    typography: 'caption',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  <Iconify icon="solar:shield-check-bold" width={14} />
                  Secure Session
                </Box>

                <Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
                    Sign In
                  </Typography>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Dont have an account?
                    </Typography>
                    <Link
                      onClick={() => push('/register')}
                      variant="subtitle2"
                      sx={{ cursor: 'pointer', color: 'primary.main' }}
                    >
                      Get Started
                    </Link>
                  </Stack>
                </Box>
              </Stack>

              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  {!!errors.afterSubmit && (
                    <Alert severity="error" sx={{ textAlign: 'left' }}>
                      {errors.afterSubmit.message}
                    </Alert>
                  )}

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
                      onClick={() => push('/forgot-password')}
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
                    Authorize Login
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

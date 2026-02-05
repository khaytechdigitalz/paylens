import { useState } from 'react';
import * as Yup from 'yup';
import Head from 'next/head';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Button,
  alpha,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from '../../components/snackbar'; // Ensure this path matches your project
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
// utils
import axios from '../../utils/axios';
// ----------------------------------------------------------------------

type FormValuesProps = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  businessName?: string;
  cacNumber?: string;
  cacDocument?: File | null;
  addressProof?: File | null;
  afterSubmit?: string;
};

export default function AuthRegisterForm() {

  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().required('Email is required').email('Must be a valid email'),
    phoneNumber: Yup.string().required('Phone number is required'),
    password: Yup.string().required('Password is required').min(8, 'Min 8 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm password')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    ...(accountType === 'business' && {
      businessName: Yup.string().required('Business name is required'),
      cacNumber: Yup.string().required('CAC Registration number is required'),
    }),
  });

  const defaultValues: FormValuesProps = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    cacNumber: '',
    cacDocument: null,
    addressProof: null,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    setValue,
    watch,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const formData = new FormData();
      formData.append('accountType', accountType);
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.confirmPassword);

      if (accountType === 'business') {
        formData.append('businessName', data.businessName || '');
        formData.append('cacNumber', data.cacNumber || '');
        if (data.cacDocument) formData.append('cacDocument', data.cacDocument);
        if (data.addressProof) formData.append('addressProof', data.addressProof);
      }

      await axios.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('Registration successful!', { variant: 'success' });
      // Redirect logic here
    } catch (error) {
      console.error('Registration Error:', error);

      // 1. Loop through backend validation errors and show snackbars
      if (error.errors) {
        const serverErrors = error.errors;

        Object.keys(serverErrors).forEach((key) => {
          const messages = serverErrors[key];

          // Display a toast for each specific field error
          messages.forEach((msg: string) => {
            enqueueSnackbar(msg, { variant: 'error' });
          });

          // Also set the error on the form field itself
          let fieldName = key as keyof FormValuesProps;
          if (key === 'name') fieldName = 'firstName';

          setError(fieldName, {
            type: 'server',
            message: messages[0],
          });
        });
      } else {
        // Fallback for non-validation errors (e.g., 500 error)
        enqueueSnackbar(error.message || 'Something went wrong', { variant: 'error' });
      }

      setError('afterSubmit', {
        ...error,
        message: error.message || 'Registration failed. Please check your details.',
      });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: 'cacDocument' | 'addressProof'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(name, file);
    }
  };

  return (
    <>
      <Head>
        <title>Register | EasyCredit</title>
      </Head>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

          <Box>
            <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block' }}>
              Account Type
            </Typography>
            <ToggleButtonGroup
              fullWidth
              value={accountType}
              exclusive
              onChange={(e, val) => val && setAccountType(val)}
              color="primary"
            >
              <ToggleButton value="personal" sx={{ py: 1.2, gap: 1 }}>
                <Iconify icon="solar:user-bold-duotone" width={20} /> Personal
              </ToggleButton>
              <ToggleButton value="business" sx={{ py: 1.2, gap: 1 }}>
                <Iconify icon="solar:shop-bold-duotone" width={20} /> Business
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {accountType === 'business' && (
            <Stack
              spacing={2.5}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="subtitle2" color="primary.main">
                Business Details
              </Typography>
              <RHFTextField name="businessName" label="Business Name" />
              <RHFTextField name="cacNumber" label="CAC RC / BN Number" />

              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                    sx={{ py: 1.5, borderStyle: 'dashed', textTransform: 'none' }}
                  >
                    {values.cacDocument ? 'CAC Uploaded' : 'Upload CAC'}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileChange(e, 'cacDocument')}
                    />
                  </Button>
                  {values.cacDocument && (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {values.cacDocument.name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                    sx={{ py: 1.5, borderStyle: 'dashed', textTransform: 'none' }}
                  >
                    {values.addressProof ? 'Proof Uploaded' : 'Proof of Address'}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileChange(e, 'addressProof')}
                    />
                  </Button>
                  {values.addressProof && (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {values.addressProof.name}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Stack>
          )}

          <Typography variant="subtitle2">Owner Information</Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <RHFTextField name="firstName" label="First name" />
            <RHFTextField name="lastName" label="Last name" />
          </Stack>

          <RHFTextField name="email" label="Email address" />
          <RHFTextField name="phoneNumber" label="Phone Number" />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <RHFTextField
              name="password"
              label="Password"
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
            <RHFTextField name="confirmPassword" label="Confirm Password" type="password" />
          </Stack>

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
              mt: 2,
              py: 1.5,
              fontSize: 16,
            }}
          >
            Create {accountType === 'business' ? 'Business' : 'Personal'} Account
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}

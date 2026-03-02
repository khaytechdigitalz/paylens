import { useState } from 'react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import Head from 'next/head';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Container,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  alpha, // Fixed: Added alpha import
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Logo from '../../components/logo';
import { useSnackbar } from '../../components/snackbar';
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
// utils
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const STEPS = ['Account Type', 'Personal Info', 'Verification'];

type FormValuesProps = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  businessName?: string;
  cacNumber?: string;
  cacDocument: File | null;
  addressProof: File | null;
  afterSubmit?: string;
};

export default function AuthRegisterForm() {
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');

  // Schema handles conditional validation for Business type
  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    phoneNumber: Yup.string().required('Phone number is required'),
    password: Yup.string().required('Password is required').min(8, 'Min 8 characters'),
    ...(accountType === 'business' && {
      businessName: Yup.string().required('Business name is required'),
      cacNumber: Yup.string().required('CAC/RC number is required'),
    }),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      businessName: '',
      cacNumber: '',
      cacDocument: null, // Initialized as null
      addressProof: null,
    },
  });

  const {
    watch,
    trigger,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleNext = async () => {
    let fields: any[] = [];
    if (activeStep === 1) fields = ['firstName', 'lastName', 'email', 'phoneNumber'];
    if (activeStep === 2) fields = ['password', 'businessName', 'cacNumber'];

    const isValid = await trigger(fields);
    if (isValid || activeStep === 0) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Fixed: name parameter strictly typed to prevent 'File' assignable to 'null' error
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: 'cacDocument' | 'addressProof'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(name, file, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const formData = new FormData();
      formData.append('accountType', accountType);

      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value && key !== 'cacDocument' && key !== 'addressProof') {
          formData.append(key, value as string);
        }
      });

      // Append files separately to ensure correct formatting
      if (data.cacDocument) formData.append('cacDocument', data.cacDocument);
      if (data.addressProof) formData.append('addressProof', data.addressProof);

      
      await axios.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('Registration successful!');
      push('/dashboard');
    } catch (error) {
      enqueueSnackbar(error.message || 'Error occurred', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Head>
        <title>Register | CredDot</title>
      </Head>

      <Stack alignItems="center" sx={{ mb: 4 }}>
        <Logo sx={{ width: 64, height: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Join CredDot and manage your finances effortlessly.
        </Typography>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          borderStyle: 'solid',
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* STEP 0: ACCOUNT TYPE */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  I am registering as a:
                </Typography>
                <ToggleButtonGroup
                  fullWidth
                  value={accountType}
                  exclusive
                  onChange={(e, v) => v && setAccountType(v)}
                  color="primary"
                >
                  <ToggleButton value="personal" sx={{ py: 3, flexDirection: 'column', gap: 1 }}>
                    <Iconify icon="solar:user-bold-duotone" width={32} />
                    <Typography variant="subtitle2">Individual</Typography>
                  </ToggleButton>
                  <ToggleButton value="business" sx={{ py: 3, flexDirection: 'column', gap: 1 }}>
                    <Iconify icon="solar:shop-bold-duotone" width={32} />
                    <Typography variant="subtitle2">Business</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {/* STEP 1: PERSONAL INFO */}
            {activeStep === 1 && (
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField name="firstName" label="First Name" />
                  <RHFTextField name="lastName" label="Last Name" />
                </Stack>
                <RHFTextField name="email" label="Email Address" />
                <RHFTextField name="phoneNumber" label="Phone Number" />
              </Stack>
            )}

            {/* STEP 2: VERIFICATION & SECURITY */}
            {activeStep === 2 && (
              <Stack spacing={2.5}>
                {accountType === 'business' && (
                  <Stack
                    spacing={2.5}
                    sx={{
                      p: 2.5,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <Typography variant="subtitle2" color="primary.main">
                      Business Details
                    </Typography>
                    <RHFTextField name="businessName" label="Registered Business Name" />
                    <RHFTextField name="cacNumber" label="CAC RC / BN Number" />

                    <Stack direction="row" spacing={2}>
                      <UploadButton
                        label={values.cacDocument ? 'CAC Attached' : 'Upload CAC'}
                        onUpload={(e) => handleFileChange(e, 'cacDocument')}
                        file={values.cacDocument}
                        icon="solar:file-send-bold"
                      />
                      <UploadButton
                        label={values.addressProof ? 'Proof Attached' : 'Address Proof'}
                        onUpload={(e) => handleFileChange(e, 'addressProof')}
                        file={values.addressProof}
                        icon="solar:map-point-bold"
                      />
                    </Stack>
                  </Stack>
                )}

                <RHFTextField
                  name="password"
                  label="Create Password"
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
              </Stack>
            )}

            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

            <Stack direction="row" spacing={2}>
              {activeStep > 0 && (
                <Button fullWidth size="large" variant="outlined" onClick={handleBack}>
                  Back
                </Button>
              )}

              {activeStep < 2 ? (
                <Button
                  fullWidth
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'grey.800' },
                    boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.common.black, 0.24)}`,
                  }}
                  size="large"
                  variant="contained"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              ) : (
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{
                    bgcolor: 'text.primary',
                    color: (theme) =>
                      theme.palette.mode === 'light' ? 'common.white' : 'grey.800',
                  }}
                >
                  Create Account
                </LoadingButton>
              )}
            </Stack>

            <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 2 }}>
              <Typography variant="body2">Already have an account?</Typography>
              <Link onClick={() => push('/login')} variant="subtitle2" sx={{ cursor: 'pointer' }}>
                Login Here
              </Link>
            </Stack>
          </Stack>
        </FormProvider>
      </Paper>
    </Container>
  );
}

// Optimized Upload Component
interface UploadButtonProps {
  label: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  icon: string;
}

function UploadButton({ label, onUpload, file, icon }: UploadButtonProps) {
  return (
    <Box sx={{ flex: 1 }}>
      <Button
        variant="soft"
        component="label"
        fullWidth
        color={file ? 'primary' : 'inherit'}
        startIcon={<Iconify icon={file ? 'solar:check-read-bold' : icon} />}
        sx={{
          height: 56,
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.32)}`,
          ...(file && {
            borderStyle: 'solid',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }),
        }}
      >
        <Typography variant="caption" noWrap sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        <input type="file" hidden onChange={onUpload} />
      </Button>
      {file && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: 'text.secondary',
            textAlign: 'center',
          }}
          noWrap
        >
          {file.name}
        </Typography>
      )}
    </Box>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-no-bind */
import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Container,
  Typography,
  CircularProgress,
  Divider,
  alpha,
  useTheme,
  Button,
  Tab,
  Tabs,
  TextField,
  Alert,
  MenuItem,
} from '@mui/material';
// To this:
import { LoadingButton } from '@mui/lab';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

ProfileSettingsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function ProfileSettingsPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentTab, setCurrentTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    avatar: null as File | null,
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // 2FA States// 1. Initialize state based on the user object
  const [pinType, setPinType] = useState(user?.authentication || 'email');
  const [pinData, setPinData] = useState({ pin: '', password: '' });

  // 2. Sync state if user data is loaded asynchronously (optional but recommended)
  useEffect(() => {
    if (user?.authentication) {
      setPinType(user.authentication);
    }
  }, [user?.authentication]);
  const [twoFaStep, setTwoFaStep] = useState<'initial' | 'input'>('initial');
  const [twoFaPin, setTwoFaPin] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  // authentication
  // UI Toggle States
  const [showPasswordDiv, setShowPasswordDiv] = useState(false);
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/profile/details');
      const data = response?.data.data;
      setUser(data);
      setProfileForm({ name: data.name, phone: data.phone, avatar: null });
    } catch (error) {
      enqueueSnackbar('Failed to load profile.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --- Profile Update Logic ---
  const handleUpdateProfile = async () => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('phone', profileForm.phone);
      if (profileForm.avatar) formData.append('avatar', profileForm.avatar);

      const response = await axios.post('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      enqueueSnackbar(response.data.message || 'Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Update failed', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Password Update Logic ---
  const handleUpdatePassword = async () => {
    setActionLoading(true);
    try {
      const response = await axios.post('/profile/updatepassword', passwordForm);
      enqueueSnackbar(response.data.message || 'Password changed successfully');
      setShowPasswordDiv(false);
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Password update failed', {
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // --- 2FA Logic (Updated Flow) ---
  const handleInitiate2FAChange = async () => {
    setActionLoading(true);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthMessage(response.data.message || 'Authorize 2FA Status Change');
      // Directly show the input field without a secondary "Proceed" button
      setTwoFaStep('input');
    } catch (error: any) {
      enqueueSnackbar('Authorization check failed', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinal2FASubmit = async () => {
    setActionLoading(true);
    try {
      const response = await axios.post('/profile/update2fa', { pin: twoFaPin });
      enqueueSnackbar(response.data.message || '2FA status updated');
      setTwoFaStep('initial');
      setTwoFaPin('');
      fetchProfile();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || '2FA update failed', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    setActionLoading(true);
    try {
      const payload = {
        authentication_method: pinType,
        ...(pinType === 'pin' && { pin: pinData.pin, password: pinData.password }),
      };
      const response = await axios.post('/profile/updatepin', payload);
      if (response.data.status) {
        enqueueSnackbar(response.data.message);
        setPinData({ pin: '', password: '' });
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Error updating PIN', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Head>
        <title>Settings | CredDot</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Typography variant="h3" sx={{ mb: 5 }}>
          Settings
        </Typography>

        <Tabs
          value={currentTab}
          onChange={(e, val) => {
            setCurrentTab(val);
            // Reset 2FA step if user navigates away and back
            if (val !== '2fa') setTwoFaStep('initial');
          }}
          sx={{ mb: 4 }}
        >
          <Tab
            label="Profile"
            value="profile"
            icon={<Iconify icon="solar:user-id-bold-duotone" width={22} />}
            iconPosition="start"
          />
          <Tab
            label="Password"
            value="password"
            icon={<Iconify icon="solar:lock-password-bold-duotone" width={22} />}
            iconPosition="start"
          />
          <Tab
            label="2FA Security"
            value="2fa"
            icon={<Iconify icon="solar:shield-check-bold-duotone" width={22} />}
            iconPosition="start"
          />
          <Tab
            label="Transaction PIN"
            value="pin_settings"
            icon={<Iconify icon="solar:key-bold-duotone" width={22} />}
            iconPosition="start"
          />
        </Tabs>

        <Grid container spacing={3}>
          {/* Tab 1: Profile Settings */}
          {currentTab === 'profile' && (
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Personal Information
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                      src={
                        profileForm.avatar
                          ? URL.createObjectURL(profileForm.avatar)
                          : user?.avatar_url
                      }
                      sx={{ width: 80, height: 80 }}
                    />
                    <Button
                      variant="soft"
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Avatar
                    </Button>
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, avatar: e.target.files?.[0] || null })
                      }
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email}
                    disabled
                    helperText="Verification required to change email"
                  />

                  <LoadingButton
                    variant="contained"
                    size="large"
                    onClick={handleUpdateProfile}
                    loading={actionLoading}
                  >
                    Save Changes
                  </LoadingButton>
                </Stack>
              </Card>
            </Grid>
          )}

          {/* Tab 2: Password Settings */}
          {currentTab === 'password' && (
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Change Password
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, current_password: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        new_password_confirmation: e.target.value,
                      })
                    }
                  />
                  <LoadingButton
                    variant="contained"
                    size="large"
                    onClick={handleUpdatePassword}
                    loading={actionLoading}
                  >
                    Update Password
                  </LoadingButton>
                </Stack>
              </Card>
            </Grid>
          )}

          {/* Tab 3: 2FA Settings (Streamlined) */}
          {currentTab === '2fa' && (
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Two-Factor Authentication (2FA)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Maintain a high level of security for your wallet and sensitive operations.
                </Typography>

                {twoFaStep === 'initial' ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 2,
                      // Dynamic Background and Border colors
                      bgcolor: (theme) =>
                        user?.two_fa
                          ? alpha(theme.palette.success.main, 0.08)
                          : alpha(theme.palette.error.main, 0.08),
                      border: (theme) =>
                        `1px dashed ${
                          user?.two_fa ? theme.palette.success.main : theme.palette.error.main
                        }`,
                    }}
                  >
                    <Iconify
                      icon={
                        user?.two_fa
                          ? 'solar:shield-check-bold-duotone'
                          : 'solar:shield-warning-bold-duotone'
                      }
                      width={64}
                      // Dynamic Icon color
                      sx={{
                        mb: 2,
                        color: user?.two_fa ? 'success.main' : 'error.main',
                      }}
                    />

                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: user?.two_fa ? 'success.dark' : 'error.dark' }}
                    >
                      2FA Status: {user?.two_fa ? 'ENABLED' : 'DISABLED'}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                      {user?.two_fa
                        ? 'Your account is currently protected with an extra layer of security.'
                        : 'Your account is less secure. We recommend enabling 2FA immediately.'}
                    </Typography>

                    <LoadingButton
                      variant="contained"
                      size="large"
                      // Dynamic Button color
                      color={user?.two_fa ? 'error' : 'success'}
                      onClick={handleInitiate2FAChange}
                      loading={actionLoading}
                    >
                      {user?.two_fa ? 'Turn Off 2FA' : 'Turn On 2FA'}
                    </LoadingButton>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {authMessage && (
                      <Alert severity="info" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                        {authMessage}
                      </Alert>
                    )}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Enter Transaction PIN to Confirm
                      </Typography>
                      <TextField
                        fullWidth
                        autoFocus
                        type="password"
                        placeholder="****"
                        value={twoFaPin}
                        inputProps={{
                          maxLength: 4,
                          style: {
                            textAlign: 'center',
                            letterSpacing: 10,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                          },
                        }}
                        onChange={(e) => setTwoFaPin(e.target.value)}
                      />
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <LoadingButton
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleFinal2FASubmit}
                        loading={actionLoading}
                        disabled={twoFaPin.length < 4}
                      >
                        Confirm Update
                      </LoadingButton>
                      <LoadingButton
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        onClick={() => setTwoFaStep('initial')}
                      >
                        Cancel
                      </LoadingButton>
                    </Stack>
                  </Stack>
                )}
              </Card>
            </Grid>
          )}

          {/* Tab 4: Transaction PIN Settings */}
          {currentTab === 'pin_settings' && (
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Transaction Authorization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Control how your funds are moved. Switch between automated Email OTP or a manual
                  Security PIN.
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    select
                    fullWidth
                    label="Authorization Method"
                    value={pinType}
                    onChange={(e) => {
                      setPinType(e.target.value);
                      // Clear pin data when switching types to keep form clean
                      setPinData({ pin: '', password: '' });
                    }}
                  >
                    <MenuItem value="email">Email OTP (Secure & Automated)</MenuItem>
                    <MenuItem value="pin">Static Transaction PIN (Faster)</MenuItem>
                  </TextField>

                  {/* Only show the PIN/Password fields if:
            1. 'pin' is selected AND 
            2. The user's CURRENT method isn't already 'pin' 
               (or if they want to update their existing PIN)
        */}
                  {pinType === 'pin' && (
                    <Stack
                      spacing={3}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'primary.main', fontWeight: 'bold' }}
                      >
                        {user?.authentication === 'pin'
                          ? 'UPDATE TRANSACTION PIN'
                          : 'SET NEW TRANSACTION PIN'}
                      </Typography>

                      <TextField
                        fullWidth
                        type="password"
                        label="4-Digit PIN"
                        placeholder="****"
                        value={pinData.pin}
                        onChange={(e) => setPinData({ ...pinData, pin: e.target.value })}
                        inputProps={{ maxLength: 4 }}
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="Account Password"
                        placeholder="Confirm with login password"
                        value={pinData.password}
                        onChange={(e) => setPinData({ ...pinData, password: e.target.value })}
                      />
                    </Stack>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <LoadingButton
                      variant="contained"
                      size="large"
                      loading={actionLoading}
                      onClick={handleUpdatePin}
                      // Disable if:
                      // 1. PIN mode is selected but fields are empty
                      // 2. Email is selected but user is ALREADY on email (nothing to change)
                      disabled={
                        (pinType === 'pin' && (!pinData.pin || !pinData.password)) ||
                        (pinType === 'email' && user?.authentication === 'email')
                      }
                    >
                      {user?.authentication === pinType && pinType === 'email'
                        ? 'Already Active'
                        : 'Save Settings'}
                    </LoadingButton>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          )}

          {/* User Status Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={user?.avatar_url}
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  border: `2px solid ${theme.palette.divider}`,
                }}
              />
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
                Account ID: #{user?.id}
              </Typography>

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

              <Stack spacing={1.5}>
                <SummaryRow label="KYC Status" value={user?.kyc_status} color="success.main" />
                <SummaryRow label="Account Tier" value={`Tier ${user?.tier}`} />
                <SummaryRow label="Account Mode" value={user?.mode} />
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: color || 'text.primary' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

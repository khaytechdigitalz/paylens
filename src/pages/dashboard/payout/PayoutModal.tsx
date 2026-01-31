/* eslint-disable no-nested-ternary */
import { useState, useEffect, useMemo } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  alpha,
  IconButton,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
// utils
import axios from '../../../utils/axios';
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
};

export default function PayoutModal({ open, onClose, onSuccess }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [banks, setBanks] = useState<any[]>([]);
  const [bankSearch, setBankSearch] = useState('');

  // Form States
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [narration, setNarration] = useState('');

  // Security States
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState<'PIN' | 'OTP'>('PIN');

  // Feedback States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Loading States
  const [loading, setLoading] = useState({
    banks: false,
    validating: false,
    auth: false,
    submitting: false,
  });

  const filteredBanks = useMemo(
    () => banks.filter((bank) => bank.name.toLowerCase().includes(bankSearch.toLowerCase())),
    [banks, bankSearch]
  );

  useEffect(() => {
    if (open) {
      handleReset();
      fetchBanks();
    }
  }, [open]);

  const handleReset = () => {
    setActiveStep(0);
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setAmount('');
    setNarration('');
    setPin('');
    setOtp('');
    setAuthMode('PIN');
    setErrorMessage(null);
    setAuthMessage(null);
    setBankSearch('');
  };

  const fetchBanks = async () => {
    setLoading((prev) => ({ ...prev, banks: true }));
    try {
      const response = await axios.get('/monnify/banklist');
      setBanks(response.data.banks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, banks: false }));
    }
  };

  const handleValidateAccount = async (manualNumber?: string) => {
    const numberToValidate = manualNumber || accountNumber;
    if (numberToValidate.length !== 10 || !bankCode) return;
    setLoading((prev) => ({ ...prev, validating: true }));
    setAccountName('');
    setErrorMessage(null);
    try {
      const response = await axios.post('/monnify/validateaccount', {
        account_number: numberToValidate,
        bank_code: bankCode,
      });
      if (response.data.status === 'success' || response.data.ok) {
        setAccountName(response.data.message);
      } else {
        setErrorMessage(response.data.message || 'Could not resolve account');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Invalid account details');
    } finally {
      setLoading((prev) => ({ ...prev, validating: false }));
    }
  };

  const handleProceedToAuth = async () => {
    setLoading((prev) => ({ ...prev, auth: true }));
    setErrorMessage(null);
    try {
      const response = await axios.get('/payouts/check_auth');
      if (response.data.status === 'otp_required') {
        setAuthMode('OTP');
        setAuthMessage(response.data.message);
      } else {
        setAuthMode('PIN');
        setAuthMessage(null);
      }
      setActiveStep(2);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Authentication check failed');
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  // --- IMPROVED FINAL SUBMISSION WITH ERROR ALERT ---
  const handleSubmitPayout = async () => {
    setLoading((prev) => ({ ...prev, submitting: true }));
    setErrorMessage(null); // Clear previous errors

    try {
      const response = await axios.post('/monnify/transfer', {
        bank_code: bankCode,
        account_number: accountNumber,
        amount,
        narration,
        pin: authMode === 'PIN' ? pin : undefined,
        otp: authMode === 'OTP' ? otp : undefined,
      });

      // Check for success flags in the response body
      if (response.data.status === 'success' || response.data.ok === true) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Handle cases where request completes but business logic fails (e.g. Insufficient funds)
        setErrorMessage(
          response.data.message || 'Transaction could not be completed. Please try again.'
        );
      }
    } catch (error: any) {
      // Handle actual API errors (400, 401, 500, etc)
      const serverMessage =
        error.response?.data?.message || error.message || 'Network error occurred during transfer';
      setErrorMessage(serverMessage);
      console.error('Payout Final Error:', error);
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const progress = ((activeStep + 1) / 3) * 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />

      <DialogTitle
        sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 40, height: 40 }}>
            <Iconify
              icon={
                activeStep === 0
                  ? 'solar:verified-check-bold-duotone'
                  : activeStep === 1
                  ? 'solar:card-send-bold-duotone'
                  : 'solar:shield-check-bold-duotone'
              }
            />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {activeStep === 0 ? 'Beneficiary' : activeStep === 1 ? 'Amount' : 'Authorization'}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} edge="end">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Stack spacing={3}>
          {/* VISIBLE ERROR ALERT */}
          {errorMessage && (
            <Alert
              severity="error"
              variant="filled"
              onClose={() => setErrorMessage(null)}
              sx={{ borderRadius: 1.5, fontWeight: 600 }}
            >
              {errorMessage}
            </Alert>
          )}

          {activeStep === 0 && (
            <Stack spacing={2.5}>
              <TextField
                select
                fullWidth
                label="Select Bank"
                value={bankCode}
                onChange={(e) => {
                  setBankCode(e.target.value);
                  setAccountName('');
                  setErrorMessage(null);
                }}
                SelectProps={{
                  MenuProps: { PaperProps: { sx: { maxHeight: 300 } } },
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    position: 'sticky',
                    top: 0,
                    bgcolor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search banks..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                {filteredBanks.map((bank) => (
                  <MenuItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Account Number"
                type="number"
                value={accountNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 10) {
                    setAccountNumber(val);
                    if (val.length === 10 && bankCode) handleValidateAccount(val);
                  }
                }}
                InputProps={{
                  endAdornment: loading.validating && <CircularProgress size={20} />,
                }}
              />

              {accountName && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                    border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: 'success.darker', fontWeight: 700 }}>
                    {accountName}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={3}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}
              >
                <Avatar sx={{ width: 40, height: 40 }}>{accountName.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{accountName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {accountNumber}
                  </Typography>
                </Box>
              </Stack>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                sx={{ '& .MuiInputBase-input': { fontSize: 24, fontWeight: 800 } }}
              />
              <TextField
                fullWidth
                label="Narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  width: '100%',
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {fCurrency(amount, 'NGN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Disbursement
                </Typography>
              </Box>

              <Box sx={{ width: '100%' }}>
                {authMessage && (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ display: 'block', mb: 2, textAlign: 'center', fontWeight: 600 }}
                  >
                    {authMessage}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  type={authMode === 'PIN' ? 'password' : 'text'}
                  label={authMode === 'PIN' ? 'Enter PIN' : 'Enter OTP'}
                  value={authMode === 'PIN' ? pin : otp}
                  onChange={(e) =>
                    authMode === 'PIN'
                      ? setPin(e.target.value.slice(0, 4))
                      : setOtp(e.target.value.slice(0, 6))
                  }
                  inputProps={{
                    style: {
                      textAlign: 'center',
                      letterSpacing: '12px',
                      fontSize: '24px',
                      fontWeight: 900,
                    },
                  }}
                  autoFocus
                />
              </Box>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {activeStep > 0 && (
          <Button color="inherit" onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <LoadingButton
          variant="contained"
          size="large"
          loading={activeStep === 1 ? loading.auth : activeStep === 2 ? loading.submitting : false}
          disabled={
            (activeStep === 0 && !accountName) ||
            (activeStep === 1 && !amount) ||
            (activeStep === 2 && (authMode === 'PIN' ? pin.length < 4 : otp.length < 6))
          }
          onClick={() =>
            activeStep === 0
              ? setActiveStep(1)
              : activeStep === 1
              ? handleProceedToAuth()
              : handleSubmitPayout()
          }
          sx={{ height: 50, minWidth: 140 }}
        >
          {activeStep === 0 ? 'Continue' : activeStep === 1 ? 'Next' : 'Authorize Payout'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

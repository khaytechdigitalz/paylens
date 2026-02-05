/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useSnackbar } from 'notistack';

import { useRouter } from 'next/navigation'; // Use 'next/router' if using Pages Router

// Inside your component:
// @mui
import {
  Container,
  Typography,
  Stack,
  Card,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Switch,
  Grid,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
// utils
import axios from '../../../utils/axios';
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

PageSix.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageSix() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettingsContext();

const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // API Data State
  const [apiData, setApiData] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [openRollDialog, setOpenRollDialog] = useState(false);

  // Webhook Local State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState(false);

  // --- FETCH API KEYS ---
  const getApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/apikeys');
      const data = response.data.data;
      setApiData(data);
      setWebhookUrl(data.webhook_url || '');
      setWebhookStatus(data.webhook_status === 'enabled');
    } catch (error) {
      enqueueSnackbar('Failed to fetch API keys', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    getApiKeys();
  }, [getApiKeys]);

  // --- ROLL KEYS ---
  const handleRollKeys = async () => {
    try {
      setSubmitting(true);
      await axios.post('/apikeys/roll', { mode: apiData?.mode || 'test' });
      enqueueSnackbar('API Keys rolled successfully', { variant: 'success' });
      getApiKeys(); // Refresh data
      setOpenRollDialog(false);
    } catch (error) {
      enqueueSnackbar('Failed to roll keys', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- UPDATE WEBHOOK ---
  const handleUpdateWebhook = async () => {
    try {
      setSubmitting(true);
      await axios.post('/apikeys/webhook/update', {
        webhook_url: webhookUrl,
        webhook_status: webhookStatus ? 'enabled' : 'disabled',
      });
      enqueueSnackbar('Webhook settings updated', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update webhook', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('Copied to clipboard');
  };

  if (loading) return <LinearProgress />;


  return (
    <>
      <Head>
        <title> API Configuration | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h3">API Configuration</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Current Mode:{' '}
            <strong
              style={{
                color:
                  apiData?.mode === 'live'
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
              }}
            >
              {apiData?.mode?.toUpperCase()}
            </strong>
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* API Keys Card */}
              <Card sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">Credentials</Typography>
                  <Button
                    size="small"
                    color="error"
                    variant="soft"
                    startIcon={<Iconify icon="eva:refresh-fill" />}
                    onClick={() => setOpenRollDialog(true)}
                  >
                    Roll Keys
                  </Button>
                </Stack>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Security Warning</AlertTitle>
                  Rolling keys will immediately invalidate your current integration.
                </Alert>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Public Key"
                    value={apiData?.public_key || ''}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => handleCopy(apiData?.public_key)}>
                            <Iconify icon="eva:copy-fill" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Secret Key"
                    type={showSecret ? 'text' : 'password'}
                    value={apiData?.secret_key || ''}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowSecret(!showSecret)}>
                            <Iconify icon={showSecret ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                          </IconButton>
                          <IconButton onClick={() => handleCopy(apiData?.secret_key)}>
                            <Iconify icon="eva:copy-fill" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Card>

              {/* Webhook Card */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Webhook Settings
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2">Webhook Status</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Notifications are currently {webhookStatus ? 'Live' : 'Paused'}.
                      </Typography>
                    </Box>
                    <Switch
                      checked={webhookStatus}
                      onChange={(e) => setWebhookStatus(e.target.checked)}
                    />
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <TextField
                    fullWidth
                    label="Webhook Endpoint URL"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-api.com/webhooks"
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="inherit"
                      onClick={handleUpdateWebhook}
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save Webhook Configuration'}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Subscribed Events
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    'transaction.success',
                    'transaction.failed',
                    'transfer.success',
                    'refund.completed',
                  ].map((event) => (
                    <Stack key={event} direction="row" alignItems="center" spacing={1}>
                      <Iconify
                        icon="eva:checkmark-circle-2-fill"
                        sx={{ color: 'success.main' }}
                        width={20}
                      />
                      <Typography variant="body2">{event}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="eva:code-fill" sx={{ color: 'info.main' }} />
                    <Typography variant="h6">Integration Help</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Need to integrate <b>X-PayLens</b> API ? please click the button below to
                    proceed.
                  </Typography>
                  <Button
                    onClick={() => router.push('/documentation/overview')} // Added 'router.'
                    variant="outlined"
                    color="warning"
                    fullWidth
                    startIcon={<Iconify icon="eva:external-link-fill" />}
                  >
                    Read API Docs
                  </Button>
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="eva:info-fill" sx={{ color: 'info.main' }} />
                    <Typography variant="h6">Webhook Notification</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Every webhook request contains a <b>X-PayLens-Signature</b> header for security
                    verification.
                  </Typography>
                  <Button
                    onClick={() => router.push('/dashboard/api/webhooks')} // Added 'router.'
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="eva:external-link-fill" />}
                  >
                    View Webhook Log
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* ROLL KEY DIALOG */}
        <Dialog open={openRollDialog} onClose={() => setOpenRollDialog(false)}>
          <DialogTitle>Roll API Keys?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will generate a new Public and Secret key for <b>{apiData?.mode}</b> mode. The
              old keys will stop working immediately.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button color="inherit" onClick={() => setOpenRollDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRollKeys}
              disabled={submitting}
            >
              {submitting ? 'Rolling...' : 'Yes, Roll Keys'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

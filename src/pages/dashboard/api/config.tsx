import { useState } from 'react';
// next
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Drawer,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import { useSettingsContext } from '../../../components/settings';
import { fDateTime } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

interface WebhookLog {
  id: string;
  event: string;
  url: string;
  status: number;
  timestamp: string;
  payload: object;
}

const WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: 'wh_1',
    event: 'transaction.success',
    url: '.../webhooks',
    status: 200,
    timestamp: '2026-01-17T16:20:00',
    payload: {
      id: 'TX-1234',
      amount: 1250,
      currency: 'USD',
      status: 'success',
      customer: { email: 'john@example.com' },
    },
  },
  {
    id: 'wh_2',
    event: 'transaction.failed',
    url: '.../webhooks',
    status: 200,
    timestamp: '2026-01-17T15:45:00',
    payload: { id: 'TX-5678', error: 'Insufficient funds', status: 'failed' },
  },
  {
    id: 'wh_3',
    event: 'refund.completed',
    url: '.../webhooks',
    status: 500,
    timestamp: '2026-01-17T14:10:00',
    payload: { id: 'RF-9901', original_tx: 'TX-1234', amount: 1250 },
  },
];

// ----------------------------------------------------------------------

PageSix.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageSix() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();

  // API Key States
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey, setApiKey] = useState('pk_live_51Mzh29Klx0Jp0Vz7nQ9');
  const [secretKey, setSecretKey] = useState('sk_live_99sh29Klx0Jp0Vz7nQ98872kls0');

  // UI & Webhook States
  const [openRollDialog, setOpenRollDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/webhooks/paylens');
  const [isLive, setIsLive] = useState(true);

  // Drawer States
  const [openLogDrawer, setOpenLogDrawer] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenLog = (log: WebhookLog) => {
    setSelectedLog(log);
    setOpenLogDrawer(true);
  };

  const handleRollKeys = () => {
    const newId = Math.random().toString(36).substring(7);
    setApiKey(`pk_live_${newId}`);
    setSecretKey(`sk_live_${newId}Secret`);
    setOpenRollDialog(false);
  };

  return (
    <>
      <Head>
        <title> API Configuration | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h3">API Configuration</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage your keys and debug webhook interactions.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Configuration Section */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">API Keys</Typography>
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
                    value={apiKey}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => handleCopy(apiKey)}>
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
                    value={secretKey}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowSecret(!showSecret)}>
                            <Iconify icon={showSecret ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                          </IconButton>
                          <IconButton onClick={() => handleCopy(secretKey)}>
                            <Iconify icon="eva:copy-fill" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Webhook Settings
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2">Enable Webhooks</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Receive real-time notifications on your server.
                      </Typography>
                    </Box>
                    <Switch checked={isLive} onChange={(e) => setIsLive(e.target.checked)} />
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <TextField
                    fullWidth
                    label="Webhook Endpoint URL"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="inherit">
                      Save Changes
                    </Button>
                    <Button variant="outlined" startIcon={<Iconify icon="eva:paper-plane-fill" />}>
                      Test Connection
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Sidebar Section */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Subscribed Events
                </Typography>
                <Stack spacing={1.5}>
                  {['transaction.success', 'transaction.failed', 'refund.completed'].map(
                    (event) => (
                      <Stack key={event} direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="eva:checkmark-circle-2-fill"
                          sx={{ color: 'success.main' }}
                          width={20}
                        />
                        <Typography variant="body2">{event}</Typography>
                      </Stack>
                    )
                  )}
                </Stack>
              </Card>

              {/* RESTORED INTEGRATION HELP CARD */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="eva:info-fill" sx={{ color: 'info.main' }} />
                    <Typography variant="h6">Integration Help</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Need help integrating PayLens? Check our documentation for authentication
                    patterns, security headers, and request signing.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="eva:external-link-fill" />}
                  >
                    View API Docs
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Webhook History Table */}
          <Grid item xs={12}>
            <Card>
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">Recent Webhook Deliveries</Typography>
                <Button
                  variant="soft"
                  size="small"
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                  onClick={() => push('/dashboard/api/webhooks')}
                >
                  View All Logs
                </Button>
              </Box>

              <TableContainer sx={{ position: 'relative' }}>
                <Scrollbar>
                  <Table sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Delivery Time</TableCell>
                        <TableCell align="right">Payload</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {WEBHOOK_LOGS.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{log.event}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.5,
                                typography: 'caption',
                                fontWeight: 'bold',
                                bgcolor: log.status === 200 ? 'success.lighter' : 'error.lighter',
                                color: log.status === 200 ? 'success.dark' : 'error.dark',
                              }}
                            >
                              {log.status} {log.status === 200 ? 'OK' : 'Error'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {fDateTime(log.timestamp)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleOpenLog(log)} color="primary">
                              <Iconify icon="eva:arrow-forward-fill" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>

        {/* LOG DETAIL DRAWER */}
        <Drawer
          anchor="right"
          open={openLogDrawer}
          onClose={() => setOpenLogDrawer(false)}
          PaperProps={{ sx: { width: { xs: 1, sm: 480 } } }}
        >
          {selectedLog && (
            <Box sx={{ p: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6">Log Detail</Typography>
                <IconButton onClick={() => setOpenLogDrawer(false)}>
                  <Iconify icon="eva:close-fill" />
                </IconButton>
              </Stack>

              <Stack spacing={3}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    Event Type
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'primary.main' }}>
                    {selectedLog.event}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Request Payload
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: '#1C252E',
                      color: '#BCC2C8',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      overflow: 'auto',
                      maxHeight: 400,
                    }}
                  >
                    <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                  </Box>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleCopy(JSON.stringify(selectedLog.payload))}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    fullWidth
                    variant="soft"
                    color="info"
                    startIcon={<Iconify icon="eva:refresh-fill" />}
                  >
                    Resend
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Drawer>

        {/* ROLL KEY DIALOG */}
        <Dialog open={openRollDialog} onClose={() => setOpenRollDialog(false)}>
          <DialogTitle>Reset API Keys?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure? This action will generate new keys and <strong>immediately stop</strong>{' '}
              all current integrations using the old credentials.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button color="inherit" onClick={() => setOpenRollDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleRollKeys}>
              Roll Keys
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

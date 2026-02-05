import Head from 'next/head';
// @mui
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  Chip,
  Card,
} from '@mui/material';
// components
import Iconify from '../../components/iconify';
import ApiDocsHeader from '../../layouts/apidoc/ApiDocsHeader';

// ----------------------------------------------------------------------

type ErrorType =
  | 'auth_error'
  | 'account_error'
  | 'transfer_error'
  | 'request_error'
  | 'system_error';

const ERROR_CATEGORIES: Record<ErrorType, { label: string; color: any }> = {
  auth_error: { label: 'Authentication', color: 'error' },
  account_error: { label: 'Virtual Account', color: 'info' },
  transfer_error: { label: 'Transaction Issue', color: 'warning' },
  request_error: { label: 'Integration Error', color: 'error' },
  system_error: { label: 'Bank Connectivity', color: 'error' },
};

const ERROR_LIST = [
  // Authentication Errors (Crucial for first-time setup)
  {
    code: 'api_key_invalid',
    http: 401,
    type: 'auth_error',
    message: 'The Secret Key provided is incorrect or inactive.',
    action:
      'Verify your Secret Key in the PayLens Dashboard. Ensure you aren’t using Test Keys in Production.',
  },
  {
    code: 'api_key_missing',
    http: 401,
    type: 'auth_error',
    message: 'Authorization header is missing.',
    action: 'Pass your key as a Bearer token: Authorization: Bearer {YOUR_SECRET_KEY}',
  },

  // Virtual Account Errors
  {
    code: 'account_expired',
    http: 410,
    type: 'account_error',
    message: 'The virtual account session has timed out.',
    action:
      'The customer took too long. You must re-initialize the transaction to generate a new account.',
  },
  {
    code: 'account_not_found',
    http: 404,
    type: 'account_error',
    message: 'The virtual account reference is invalid.',
    action: 'Confirm that the reference matches the one generated during initialization.',
  },

  // Transfer / Settlement Errors
  {
    code: 'transaction_not_found',
    http: 404,
    type: 'transfer_error',
    message: 'No incoming transfer detected yet.',
    action:
      'The bank hasn’t settled the funds. Ask the customer to wait 60 seconds and click "I have paid" again.',
  },
  {
    code: 'amount_mismatch',
    http: 422,
    type: 'transfer_error',
    message: 'Received amount does not match the expected amount.',
    action: 'The payment is held. The merchant must decide to credit partially or refund.',
  },
  {
    code: 'duplicate_reference',
    http: 400,
    type: 'request_error',
    message: 'This transaction reference has already been verified.',
    action: 'This prevents double-crediting. Use a unique reference for every new checkout.',
  },

  // Bank / Connection Errors
  {
    code: 'bank_provider_offline',
    http: 503,
    type: 'system_error',
    message: 'The partner bank is currently unreachable.',
    action: 'Connectivity issue with the NIP system. Retry the verification after a short delay.',
  },
];

export default function ApiErrorReferencePage() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>Error Reference | PayLens API Documentation</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ApiDocsHeader />

        <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
          <Grid container spacing={5}>
            {/* LEFT SIDE: ERROR TABLE */}
            <Grid item xs={12} md={8}>
              <Stack spacing={4}>
                <Box>
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{ fontWeight: 800, letterSpacing: 1.2 }}
                  >
                    STATUS CODES & ERRORS
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                    Bank Transfer Errors
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1.6 }}
                  >
                    Our API returns standard HTTP status codes. For most errors, we also include a
                    machine-readable <code>code</code> in the response body to help you automate
                    your error handling.
                  </Typography>
                </Box>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2, overflow: 'hidden' }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: 'background.neutral' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Error Code</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Description & Solution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ERROR_LIST.map((err) => (
                        <TableRow key={err.code} hover>
                          <TableCell sx={{ width: 260 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontFamily: 'monospace', color: 'error.main', mb: 0.5 }}
                            >
                              {err.code}
                            </Typography>
                            <Chip
                              label={ERROR_CATEGORIES[err.type as ErrorType].label}
                              size="small"
                              color={ERROR_CATEGORIES[err.type as ErrorType].color}
                              variant="soft"
                              sx={{
                                fontSize: 10,
                                height: 18,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ width: 80 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: 'text.secondary' }}
                            >
                              {err.http}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              {err.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              <span
                                style={{ color: theme.palette.success.main, fontWeight: 'bold' }}
                              >
                                FIX:
                              </span>{' '}
                              {err.action}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Grid>

            {/* RIGHT SIDE: JSON SCHEMA */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3} sx={{ position: 'sticky', top: 120 }}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.disabled', fontWeight: 700, mb: 1.5, display: 'block' }}
                  >
                    Auth Error Example
                  </Typography>
                  <Paper
                    sx={{ p: 2.5, bgcolor: '#1E1E1E', borderRadius: 2, border: '1px solid #333' }}
                  >
                    <Typography
                      component="pre"
                      sx={{ fontFamily: 'monospace', fontSize: 13, color: '#9CDCFE' }}
                    >
                      {`{
  "status": false,
  "message": "Invalid API Key",
  "data": {
    "code": "api_key_invalid",
    "type": "auth_error"
  }
}`}
                    </Typography>
                  </Paper>
                </Box>

                <Card
                  variant="outlined"
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.error.main, 0.02),
                    borderColor: alpha(theme.palette.error.main, 0.2),
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Iconify
                      icon="solar:shield-warning-bold-duotone"
                      width={24}
                      color="error.main"
                    />
                    <Box>
                      <Typography variant="subtitle2" color="error.main">
                        Security Lockout
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Multiple failed authentication attempts with an incorrect API key may lead
                        to your IP being temporarily throttled.
                      </Typography>
                    </Box>
                  </Stack>
                </Card>

                <Divider />

                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    Last updated: February 2026
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

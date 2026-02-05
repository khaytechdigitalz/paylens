/* eslint-disable react/no-unescaped-entities */
import Head from 'next/head';
// @mui
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
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
} from '@mui/material';
// components
import Iconify from '../../components/iconify';
import ApiDocsHeader from '../../layouts/apidoc/ApiDocsHeader';

// ----------------------------------------------------------------------

export default function ApiVerifyPage() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>API: Verify Transaction | Creddot Docs</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ApiDocsHeader />

        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
          <Grid container spacing={5}>
            {/* LEFT: DOCUMENTATION */}
            <Grid item xs={12} md={7}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>
                    Transactions
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
                    Verify Transaction
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    After a customer completes a payment, we redirect them back to your{' '}
                    <code>callback_url</code>. However, you <strong>must not</strong> rely on the
                    redirect alone. Always call this endpoint to confirm the final status of the
                    transaction.
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'info.main',
                      color: 'white',
                      borderRadius: 0.5,
                      typography: 'caption',
                      fontWeight: 'bold',
                    }}
                  >
                    GET
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: 'monospace', color: 'text.primary' }}
                  >
                    /transaction/verify/:reference
                  </Typography>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="h5" gutterBottom>
                    Path Parameters
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                        <TableRow>
                          <TableCell sx={{ py: 1.5 }}>Parameter</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle2" color="primary">
                              reference
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              string
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              The transaction reference you created during initialization.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box>
                  <Typography variant="h5" gutterBottom>
                    The Verification Lifecycle
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Verification is the final handshake. Ensure your system checks the{' '}
                    <code>data.status</code> field in the response.
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT: CODE SAMPLES */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3} sx={{ position: 'sticky', top: 110 }}>
                {/* cURL Example */}
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Sample Request
                </Typography>
                <Paper sx={{ p: 0, overflow: 'hidden', bgcolor: '#1E1E1E', borderRadius: 1.5 }}>
                  <Box sx={{ px: 2, py: 1, bgcolor: '#2D2D2D', borderBottom: '1px solid #333' }}>
                    <Typography variant="caption" sx={{ color: 'grey.400' }}>
                      cURL
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#9CDCFE' }}>
                      curl https://api.creddot.com/v1/transaction/verify/CRDDT_123 \<br />
                      &nbsp;&nbsp;-H "Authorization: Bearer YOUR_SECRET_KEY"
                    </Typography>
                  </Box>
                </Paper>

                {/* Response Example */}
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Sample Response (Success)
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#1E1E1E', color: '#D4D4D4', borderRadius: 1.5 }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px' }}>
                    {`{
  "status": true,
  "message": "Verification successful",
  "data": {
    "id": 40291,
    "status": "success",
    "reference": "PLNS_123",
    "amount": 50000,
    "gateway_response": "Successful",
    "paid_at": "2026-02-03T12:00:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "ip_address": "102.1.2.3"
  }
}`}
                  </pre>
                </Paper>

                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  <Stack direction="row" spacing={2}>
                    <Iconify
                      icon="solar:shield-warning-bold-duotone"
                      sx={{ color: 'error.main' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      <strong>Security Note:</strong> Always verify the <code>amount</code> in the
                      response matches your internal record before providing service.
                    </Typography>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

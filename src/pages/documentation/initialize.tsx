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

const PARAMETERS = [
  { name: 'email', type: 'string', required: true, desc: 'Customer email address.' },
  {
    name: 'amount',
    type: 'integer',
    required: true,
    desc: 'Amount in kobo (e.g., 10000 for 100.00).',
  },
  { name: 'currency', type: 'string', required: true, desc: 'The currency code (e.g., NGN, USD).' },
  {
    name: 'reference',
    type: 'string',
    required: false,
    desc: 'Unique case-sensitive string to track the transaction.',
  },
  {
    name: 'callback_url',
    type: 'string',
    required: false,
    desc: 'URL to redirect the user after payment.',
  },
];

export default function ApiInitializePage() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>API: Initialize Transaction | Creddot Docs</title>
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
                    Initialize Transaction
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This endpoint allows you to generate a unique checkout URL for your customers.
                    Once a transaction is initialized, you should redirect the user to the{' '}
                    <code>authorization_url</code>
                    provided in the response.
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'success.main',
                      color: 'white',
                      borderRadius: 0.5,
                      typography: 'caption',
                      fontWeight: 'bold',
                    }}
                  >
                    POST
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: 'monospace', color: 'text.primary' }}
                  >
                    /transaction/initialize
                  </Typography>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="h5" gutterBottom>
                    Request Parameters
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                        <TableRow>
                          <TableCell sx={{ py: 1.5 }}>Parameter</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Required</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {PARAMETERS.map((param) => (
                          <TableRow key={param.name}>
                            <TableCell>
                              <Typography variant="subtitle2" color="primary">
                                {param.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {param.desc}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {param.type}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Iconify
                                icon={
                                  param.required
                                    ? 'solar:check-circle-bold'
                                    : 'solar:close-circle-linear'
                                }
                                sx={{ color: param.required ? 'success.main' : 'text.disabled' }}
                                width={20}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT: CODE SAMPLES */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3} sx={{ position: 'sticky', top: 110 }}>
                {/* JSON Payload Request */}
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Request Body (JSON)
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#1E1E1E', color: '#D4D4D4', borderRadius: 1.5 }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px' }}>
                    {`{
  "email": "customer@example.com",
  "amount": 50000,
  "currency": "NGN",
  "reference": "PLNS_992039203",
  "callback_url": "https://yoursite.com/verify"
}`}
                  </pre>
                </Paper>

                {/* Response Example */}
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Expected Response
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#1E1E1E', color: '#D4D4D4', borderRadius: 1.5 }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px' }}>
                    {`{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.creddot.com/73kjs...",
    "access_code": "73kjs829skj",
    "reference": "PLNS_992039203"
  }
}`}
                  </pre>
                </Paper>

                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <Stack direction="row" spacing={2}>
                    <Iconify icon="solar:info-circle-bold-duotone" sx={{ color: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      Ensure your <code>callback_url</code> is added to your dashboard whitelist to
                      prevent redirect errors.
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

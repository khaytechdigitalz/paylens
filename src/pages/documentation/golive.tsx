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
  alpha,
  useTheme,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
// components
import Iconify from '../../components/iconify';
import ApiDocsHeader from '../../layouts/apidoc/ApiDocsHeader';

// ----------------------------------------------------------------------

const TECHNICAL_TASKS = [
  {
    title: 'Switch to Live Keys',
    desc: 'Replace all sk_test_ and pk_test_ keys with your production sk_live_ and pk_live_ keys.',
  },
  {
    title: 'Update Base URL',
    desc: 'Ensure your environment variables are pointing to https://api.paylens.com/v1.',
  },
  {
    title: 'Set Production Webhooks',
    desc: 'Update your webhook URL in the dashboard to your live, SSL-secured (HTTPS) endpoint.',
  },
  {
    title: 'Verify Signature Logic',
    desc: 'Confirm your HMAC SHA512 verification is active to prevent spoofed transactions.',
  },
];

const COMPLIANCE_TASKS = [
  {
    title: 'KYC Verification',
    desc: 'Ensure your business profile is fully verified in the PayLens dashboard to avoid settlement delays.',
  },
  {
    title: 'SSL/TLS Certificate',
    desc: 'Your website must be served over HTTPS. We will block requests from non-secure origins.',
  },
  {
    title: 'Customer Support Email',
    desc: 'Provide a valid support email so customers can reach out regarding failed transactions.',
  },
];

export default function ApiGoLivePage() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>Go-Live Checklist | PayLens API Documentation</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ApiDocsHeader />

        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Stack spacing={5}>
            {/* HERO SECTION */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Iconify icon="solar:rocket-bold-duotone" width={32} color="success.main" />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>
                Ready to go Live?
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', mt: 2 }}
              >
                Before you switch to production and start processing real payments, please complete
                the following steps to ensure a secure integration.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* TECHNICAL CHECKLIST */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 4, height: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Iconify icon="solar:code-bold" color="primary.main" />
                    Technical Readiness
                  </Typography>

                  <Stack spacing={3}>
                    {TECHNICAL_TASKS.map((task) => (
                      <FormControlLabel
                        key={task.title}
                        control={<Checkbox color="success" />}
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="subtitle2">{task.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.desc}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </Stack>
                </Card>
              </Grid>

              {/* COMPLIANCE CHECKLIST */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 4, height: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Iconify icon="solar:shield-user-bold" color="info.main" />
                    Business & Security
                  </Typography>

                  <Stack spacing={3}>
                    {COMPLIANCE_TASKS.map((task) => (
                      <FormControlLabel
                        key={task.title}
                        control={<Checkbox color="success" />}
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="subtitle2">{task.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.desc}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            {/* FINAL ACTION */}
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: `1px dashed ${theme.palette.primary.main}`,
              }}
            >
              <Typography variant="h6" gutterBottom>
                All systems checked?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Once you switch to live mode, real transactions will be processed. We recommend
                performing one "live" test with a small amount to verify the full flow.
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="primary"
                endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
                sx={{ px: 8 }}
              >
                Go to Live Dashboard
              </Button>
            </Paper>

            <Stack direction="row" justifyContent="center" spacing={4} sx={{ mt: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:chat-round-dots-bold" color="text.disabled" />
                <Typography variant="caption" color="text.disabled">
                  24/7 Developer Support
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:document-bold" color="text.disabled" />
                <Typography variant="caption" color="text.disabled">
                  Full API Specs
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

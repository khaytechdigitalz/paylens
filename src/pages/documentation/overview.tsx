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
  alpha,
  useTheme,
  IconButton,
} from '@mui/material';
// components
import Iconify from '../../components/iconify';
import ApiDocsHeader from '../../layouts/apidoc/ApiDocsHeader';

// ----------------------------------------------------------------------

export default function ApiOverviewPage() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>Documentation: Overview | CredDot API</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ApiDocsHeader />

        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
          <Grid container spacing={5}>
            {/* LEFT: CONTENT AREA */}
            <Grid item xs={12} md={7}>
              <Stack spacing={5}>
                {/* Introduction */}
                <Box>
                  <Typography variant="h3" gutterBottom sx={{ letterSpacing: -1 }}>
                    Introduction
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18 }}>
                    The CredDot API is organized around <b>REST</b>. Our API has predictable
                    resource-oriented URLs, accepts form-encoded request bodies, returns
                    JSON-encoded responses, and uses standard HTTP response codes, authentication,
                    and verbs.
                  </Typography>
                </Box>

                <Divider />

                {/* Authentication Section */}
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Authentication
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    The CredDot API uses API keys to authenticate requests. You can view and manage
                    your API keys in the CredDot Dashboard.
                    <br />
                    <br />
                    Your API keys carry many privileges, so be sure to keep them secure! Do not
                    share your secret API keys in publicly accessible areas such as GitHub,
                    client-side code, and so forth.
                  </Typography>

                  <Card
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px dashed ${theme.palette.info.main}`,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Iconify
                        icon="solar:shield-keyhole-bold-duotone"
                        width={24}
                        sx={{ color: 'info.main' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        All API requests must be made over HTTPS. Calls made over plain HTTP will
                        fail.
                      </Typography>
                    </Stack>
                  </Card>
                </Box>

                <Divider />

                {/* Response Codes */}
                <Box>
                  <Typography variant="h4" gutterBottom>
                    HTTP Response Codes
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <ResponseCode
                      code="200 - OK"
                      desc="Everything worked as expected."
                      color="success"
                    />
                    <ResponseCode
                      code="400 - Bad Request"
                      desc="The request was unacceptable, often due to missing a required parameter."
                      color="warning"
                    />
                    <ResponseCode
                      code="401 - Unauthorized"
                      desc="No valid API key provided."
                      color="error"
                    />
                    <ResponseCode
                      code="404 - Not Found"
                      desc="The requested resource doesn't exist."
                      color="error"
                    />
                    <ResponseCode
                      code="500 - Server Errors"
                      desc="Something went wrong on CredDot's end."
                      color="error"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT: CODE SNIPPET AREA */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3} sx={{ position: 'sticky', top: 120 }}>
                {/* Base URLs */}
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Service Endpoints
                </Typography>
                <Paper
                  sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', position: 'relative' }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.main', fontWeight: 'bold', display: 'block', mb: 1 }}
                  >
                    BASE URL
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    https://api.creddot.com/v1
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
                  >
                    <Iconify icon="solar:copy-linear" width={16} />
                  </IconButton>
                </Paper>

                {/* Auth Example */}
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Authentication Header
                </Typography>
                <Paper sx={{ p: 0, overflow: 'hidden', bgcolor: '#1E1E1E', borderRadius: 1.5 }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: '#2D2D2D',
                      borderBottom: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'grey.400' }}>
                      cURL
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', color: '#9CDCFE', lineHeight: 1.6 }}
                    >
                      curl https://api.creddot.com/v1/transactions \<br />
                      &nbsp;&nbsp;-u <span style={{ color: '#CE9178' }}>YOUR API KEY</span>: \
                      <br />
                      &nbsp;&nbsp;-H{' '}
                      <span style={{ color: '#CE9178' }}>"Authorization: Bearer YOUR API KEY"</span>
                    </Typography>
                  </Box>
                </Paper>

                <Card
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  }}
                >
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Important
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Replace <code>YOU API KEY</code> with your actual test or live secret key from
                    the dashboard.
                  </Typography>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function ResponseCode({ code, desc, color }: { code: string; desc: string; color: any }) {
  return (
    <Stack direction="row" spacing={2}>
      <Typography variant="subtitle2" sx={{ minWidth: 140, color: `${color}.main` }}>
        {code}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </Stack>
  );
}

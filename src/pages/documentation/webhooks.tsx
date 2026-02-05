/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
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
  alpha,
  useTheme,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
// components
import Iconify from '../../components/iconify';
import ApiDocsHeader from '../../layouts/apidoc/ApiDocsHeader';

// ----------------------------------------------------------------------

const CODE_SAMPLES: Record<string, JSX.Element> = {
  nodejs: (
    <>
      <span style={{ color: '#C678DD' }}>const</span> crypto ={' '}
      <span style={{ color: '#E5C07B' }}>require</span>(
      <span style={{ color: '#98C379' }}>'crypto'</span>);{'\n'}
      <span style={{ color: '#C678DD' }}>const</span> secret = process.
      <span style={{ color: '#E06C75' }}>env</span>.CREDDOT_SECRET_KEY;{'\n\n'}
      <span style={{ color: '#7F848E', fontStyle: 'italic' }}>// Capture the raw body</span>
      {'\n'}
      <span style={{ color: '#C678DD' }}>const</span> hash = crypto.
      <span style={{ color: '#61AFEF' }}>createHmac</span>(
      <span style={{ color: '#98C379' }}>'sha512'</span>, secret){'\n'}
      {'                   '}.<span style={{ color: '#61AFEF' }}>update</span>(JSON.
      <span style={{ color: '#61AFEF' }}>stringify</span>(req.body)){'\n'}
      {'                   '}.<span style={{ color: '#61AFEF' }}>digest</span>(
      <span style={{ color: '#98C379' }}>'hex'</span>);{'\n\n'}
      <span style={{ color: '#C678DD' }}>if</span> (hash == req.headers[
      <span style={{ color: '#98C379' }}>'x-creddot-signature'</span>]) {'{'}
      {'\n'}
      {'    '}
      <span style={{ color: '#7F848E', fontStyle: 'italic' }}>// 200 OK: Valid request</span>
      {'\n'}
      {'}'}
    </>
  ),
  php: (
    <>
      <span style={{ color: '#C678DD' }}>&lt;?php</span>
      {'\n'}
      <span style={{ color: '#E06C75' }}>$secret</span> ={' '}
      <span style={{ color: '#61AFEF' }}>getenv</span>(
      <span style={{ color: '#98C379' }}>'CREDDOT_SECRET_KEY'</span>);{'\n'}
      <span style={{ color: '#E06C75' }}>$input</span> ={' '}
      <span style={{ color: '#61AFEF' }}>file_get_contents</span>(
      <span style={{ color: '#98C379' }}>'php://input'</span>);{'\n\n'}
      <span style={{ color: '#7F848E', fontStyle: 'italic' }}>// Calculate signature</span>
      {'\n'}
      <span style={{ color: '#E06C75' }}>$hash</span> ={' '}
      <span style={{ color: '#61AFEF' }}>hash_hmac</span>(
      <span style={{ color: '#98C379' }}>'sha512'</span>,{' '}
      <span style={{ color: '#E06C75' }}>$input</span>,{' '}
      <span style={{ color: '#E06C75' }}>$secret</span>);{'\n\n'}
      <span style={{ color: '#C678DD' }}>if</span> (<span style={{ color: '#E06C75' }}>$hash</span>{' '}
      == <span style={{ color: '#E06C75' }}>$_SERVER</span>[
      <span style={{ color: '#98C379' }}>'HTTP_X_CREDDOT_SIGNATURE'</span>]) {'{'}
      {'\n'}
      {'    '}
      <span style={{ color: '#7F848E', fontStyle: 'italic' }}>// 200 OK: Valid request</span>
      {'\n'}
      {'    '}
      <span style={{ color: '#61AFEF' }}>http_response_code</span>(
      <span style={{ color: '#D19A66' }}>200</span>);{'\n'}
      {'}'}
    </>
  ),
};

export default function ApiWebhooksPage() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('nodejs');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const rawText =
      currentTab === 'nodejs'
        ? `const crypto = require('crypto');\nconst secret = process.env.CREDDOT_SECRET_KEY;...`
        : `<?php\n$secret = getenv('CREDDOT_SECRET_KEY');...`;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Head>
        <title>API Documentation: Webhooks | Creddot</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ApiDocsHeader />

        <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
          <Grid container spacing={6}>
            {/* LEFT SIDE: EDUCATIONAL CONTENT */}
            <Grid item xs={12} md={6}>
              <Stack spacing={5}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <Iconify icon="solar:bell-bing-bold" width={18} />
                    </Avatar>
                    <Typography
                      variant="overline"
                      sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.5 }}
                    >
                      Event Notifications
                    </Typography>
                  </Stack>
                  <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
                    Webhooks
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1.8 }}
                  >
                    Webhooks are automated messages sent from Creddot when something happens. They
                    are the most reliable way to trigger your business logic, like crediting a
                    user's wallet or sending a receipt.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    1. Security Verification
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    We include a signature in the header. You <strong>must</strong> verify this to
                    ensure the request is legitimately from Creddot.
                  </Typography>

                  <Stack spacing={2}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.04),
                        borderStyle: 'dashed',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="info.main"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Iconify icon="solar:shield-keyhole-bold" width={20} /> Header Name:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 'bold', mt: 0.5 }}
                      >
                        x-creddot-signature
                      </Typography>
                    </Paper>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    2. Local Development IPs
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                    While developing locally, you can use these loopback addresses to test your
                    listeners:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {['127.0.0.1'].map((ip) => (
                      <Box
                        key={ip}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                          border: `1px solid ${theme.palette.divider}`,
                          typography: 'subtitle2',
                          fontFamily: 'monospace',
                        }}
                      >
                        {ip}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT SIDE: THE PLAYGROUND */}
            <Grid item xs={12} md={6}>
              <Stack spacing={4} sx={{ position: 'sticky', top: 120 }}>
                {/* ADVANCED CODE BLOCK */}
                <Box>
                  <Paper
                    elevation={24}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: '#282c34', // One Dark Theme Background
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* IDE Header */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ px: 2, py: 1, bgcolor: '#21252b' }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }}
                        />
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }}
                        />
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }}
                        />
                      </Stack>

                      <Tabs
                        value={currentTab}
                        onChange={(e, v) => setCurrentTab(v)}
                        sx={{
                          minHeight: 32,
                          '& .MuiTab-root': {
                            color: '#abb2bf',
                            fontSize: 11,
                            fontWeight: 'bold',
                            minHeight: 32,
                            px: 2,
                            textTransform: 'none',
                          },
                          '& .Mui-selected': { color: '#61afef !important' },
                          '& .MuiTabs-indicator': { bgcolor: '#61afef', height: 2 },
                        }}
                      >
                        <Tab label="verify.js" value="nodejs" />
                        <Tab label="verify.php" value="php" />
                      </Tabs>

                      <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                        <IconButton size="small" onClick={handleCopy} sx={{ color: '#abb2bf' }}>
                          <Iconify
                            icon={copied ? 'solar:check-read-bold' : 'solar:copy-line-duotone'}
                            width={16}
                          />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* Code Content */}
                    <Box sx={{ p: 3, overflowX: 'auto' }}>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: '"Fira Code", monospace',
                          fontSize: 13,
                          lineHeight: 1.8,
                          margin: 0,
                          color: '#abb2bf',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {CODE_SAMPLES[currentTab]}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* PAYLOAD PREVIEW */}
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.disabled', mb: 1, display: 'block' }}
                  >
                    Sample Webhook Payload
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'background.neutral',
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.primary' }}
                    >
                      {`{
  "event": "transaction.success",
  "data": {
    "reference": "CRDT_LOCAL_TEST_001",
    "status": "success",
    "amount": 150000,
    "currency": "NGN"
  }
}`}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

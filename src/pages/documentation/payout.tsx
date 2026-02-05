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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
// components
import ApiDocsHeader from '../../layouts/apidoc/ApiDocsHeader';

// ----------------------------------------------------------------------

type Language = 'javascript' | 'php';

const ENDPOINTS = [
  {
    id: 'banks',
    title: 'List Banks',
    method: 'GET',
    path: '/v1/banks',
    description: 'Fetch all supported financial institutions. This list includes the bank name and the 3-digit routing code required for transfers.',
    params: [
      { name: 'country', type: 'string', desc: 'Filter by country (default: NGN).', required: false },
    ],
    js: (
      <>
        <span style={{ color: '#7F848E' }}>// Fetch banks using Axios</span>{'\n'}
        <span style={{ color: '#C678DD' }}>const</span> response = <span style={{ color: '#C678DD' }}>await</span> axios.<span style={{ color: '#61AFEF' }}>get</span>(<span style={{ color: '#98C379' }}>'https://api.paylens.com/v1/banks'</span>, {'{'}{'\n'}
        {'  '}headers: {'{'} Authorization: <span style={{ color: '#98C379' }}>`Bearer {'${'}SECRET_KEY{'}'}`</span> {'}'}{'\n'}
        {'}'});
      </>
    ),
    php: (
      <>
        <span style={{ color: '#7F848E' }}>// Using GuzzleHttp</span>{'\n'}
        <span style={{ color: '#C678DD' }}>$client</span> = <span style={{ color: '#C678DD' }}>new</span> \<span style={{ color: '#E5C07B' }}>GuzzleHttp\Client</span>();{'\n'}
        <span style={{ color: '#C678DD' }}>$response</span> = <span style={{ color: '#C678DD' }}>$client</span>-<span style={{ color: '#61AFEF' }}>request</span>(<span style={{ color: '#98C379' }}>'GET'</span>, <span style={{ color: '#98C379' }}>'https://api.paylens.com/v1/banks'</span>, [{'\n'}
        {'  '}<span style={{ color: '#98C379' }}>'headers'</span> = [{'\n'}
        {'    '}<span style={{ color: '#98C379' }}>'Authorization'</span> = <span style={{ color: '#98C379' }}>'Bearer '</span> . <span style={{ color: '#C678DD' }}>$SECRET_KEY</span>{'\n'}
        {'  '}] {'\n'}]);
      </>
    ),
  },
  {
    id: 'resolve',
    title: 'Resolve Account',
    method: 'GET',
    path: '/v1/bank/resolve',
    description: 'Verify bank account numbers and retrieve the account name. Essential for preventing erroneous payouts.',
    params: [
      { name: 'account_number', type: 'string', desc: '10-digit NUBAN number.', required: true },
      { name: 'bank_code', type: 'string', desc: '3-digit bank code.', required: true },
    ],
    js: (
      <>
        <span style={{ color: '#C678DD' }}>const</span> res = <span style={{ color: '#C678DD' }}>await</span> axios.<span style={{ color: '#61AFEF' }}>get</span>(<span style={{ color: '#98C379' }}>'/v1/bank/resolve'</span>, {'{'}{'\n'}
        {'  '}params: {'{'} account_number: <span style={{ color: '#98C379' }}>'0123456789'</span>, bank_code: <span style={{ color: '#98C379' }}>'058'</span> {'}'},{'\n'}
        {'  '}headers: {'{'} Authorization: <span style={{ color: '#98C379' }}>`Bearer {'${'}KEY{'}'}`</span> {'}'}{'\n'}
        {'}'});
      </>
    ),
    php: (
      <>
        <span style={{ color: '#C678DD' }}>$url</span> = <span style={{ color: '#98C379' }}>"https://api.creddot.com/v1/bank/resolve?account_number=0123456789&bank_code=058"</span>;{'\n'}
        <span style={{ color: '#C678DD' }}>$res</span> = <span style={{ color: '#61AFEF' }}>file_get_contents</span>(<span style={{ color: '#C678DD' }}>$url</span>, <span style={{ color: '#D19A66' }}>false</span>, <span style={{ color: '#61AFEF' }}>stream_context_create</span>([ {'\n'}
        {'  '}<span style={{ color: '#98C379' }}>'http'</span>  [<span style={{ color: '#98C379' }}>'header'</span>  <span style={{ color: '#98C379' }}>"Authorization: Bearer "</span> . <span style={{ color: '#C678DD' }}>$KEY</span>]{'\n'}
        ]));
      </>
    ),
  },
  {
    id: 'initiate',
    title: 'Initiate Payout',
    method: 'POST',
    path: '/v1/transfer/initiate',
    description: 'Debit your balance and send funds to a resolved bank account. All transfers are processed via NIP.',
    params: [
      { name: 'amount', type: 'int', desc: 'Amount in kobo.', required: true },
      { name: 'bank_code', type: 'string', desc: 'Destination bank code.', required: true },
      { name: 'account_number', type: 'string', desc: 'Recipient account.', required: true },
    ],
    js: (
      <>
        <span style={{ color: '#C678DD' }}>const</span> data = {'{'}{'\n'}
        {'  '}amount: <span style={{ color: '#D19A66' }}>500000</span>,{'\n'}
        {'  '}account_number: <span style={{ color: '#98C379' }}>"0123456789"</span>,{'\n'}
        {'  '}bank_code: <span style={{ color: '#98C379' }}>"058"</span>{'\n'}
        {'}'};{'\n'}
        <span style={{ color: '#C678DD' }}>await</span> axios.<span style={{ color: '#61AFEF' }}>post</span>(<span style={{ color: '#98C379' }}>'/v1/transfer/initiate'</span>, data, {'{'} headers {'}'});
      </>
    ),
    php: (
      <>
        <span style={{ color: '#C678DD' }}>$fields</span> = [{'\n'}
        {'  '}<span style={{ color: '#98C379' }}>"amount"</span> =&gt; <span style={{ color: '#D19A66' }}>500000</span>,{'\n'}
        {'  '}<span style={{ color: '#98C379' }}>"account_number"</span> =&gt; <span style={{ color: '#98C379' }}>"0123456789"</span>{'\n'}
        ];{'\n'}
        <span style={{ color: '#C678DD' }}>$ch</span> = <span style={{ color: '#61AFEF' }}>curl_init</span>();{'\n'}
        <span style={{ color: '#61AFEF' }}>curl_setopt</span>(<span style={{ color: '#C678DD' }}>$ch</span>, <span style={{ color: '#D19A66' }}>CURLOPT_URL</span>, <span style={{ color: '#98C379' }}>"https://api.paylens.com/v1/transfer/initiate"</span>);{'\n'}
        <span style={{ color: '#61AFEF' }}>curl_setopt</span>(<span style={{ color: '#C678DD' }}>$ch</span>, <span style={{ color: '#D19A66' }}>CURLOPT_POST</span>, <span style={{ color: '#D19A66' }}>true</span>);
      </>
    ),
  },
];

export default function PayoutsApiPage() {
  const theme = useTheme();
  const [lang, setLang] = useState<Language>('javascript');

  return (
    <>
      <Head><title>Payouts API | Multi-Language Reference</title></Head>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <ApiDocsHeader />

        <Container maxWidth="xl" sx={{ py: 10 }}>
          <Grid container spacing={6}>
            
            {/* LEFT: DOCUMENTATION & PARAMETERS */}
            <Grid item xs={12} md={6}>
              <Stack spacing={10}>
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>Payouts</Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1.8 }}>
                    Use the Payouts API to send money to any bank account in real-time. 
                    Before initiating, always fetch the bank list and resolve the account name.
                  </Typography>
                </Box>

                {ENDPOINTS.map((ep) => (
                  <Box key={ep.id}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>{ep.title}</Typography>
                      <Chip label={ep.method} size="small" sx={{ bgcolor: ep.method === 'POST' ? 'success.main' : 'info.main', color: '#fff', fontWeight: 900, borderRadius: 0.5 }} />
                    </Stack>
                    
                    <Typography variant="body2" sx={{ color: 'primary.main', mb: 2, fontFamily: 'monospace', bgcolor: alpha(theme.palette.primary.main, 0.05), p: 1, borderRadius: 1, display: 'inline-block' }}>
                      {ep.path}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{ep.description}</Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'background.neutral' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ep.params.map((p) => (
                            <TableRow key={p.name}>
                              <TableCell sx={{ color: 'primary.main', fontWeight: 600, fontFamily: 'monospace' }}>{p.name}</TableCell>
                              <TableCell><Chip label={p.type} size="small" variant="soft" sx={{ fontSize: 11 }} /></TableCell>
                              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{p.desc}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Divider sx={{ mt: 8, borderStyle: 'dashed' }} />
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* RIGHT: FIXED CODE SNIPPET BOXES */}
            <Grid item xs={12} md={6}>
              <Stack spacing={4} sx={{ position: 'sticky', top: 110 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tabs 
                    value={lang} 
                    onChange={(_, v) => setLang(v)} 
                    sx={{ 
                        bgcolor: 'background.neutral', borderRadius: 1, p: 0.5,
                        '& .MuiTabs-indicator': { display: 'none' } 
                    }}
                  >
                    <Tab label="JavaScript" value="javascript" sx={{ borderRadius: 1, minHeight: 32, fontSize: 12, fontWeight: 700, '&.Mui-selected': { bgcolor: 'background.paper', boxShadow: theme.customShadows.z8 } }} />
                    <Tab label="PHP" value="php" sx={{ borderRadius: 1, minHeight: 32, fontSize: 12, fontWeight: 700, '&.Mui-selected': { bgcolor: 'background.paper', boxShadow: theme.customShadows.z8 } }} />
                  </Tabs>
                </Box>

                {ENDPOINTS.map((ep) => (
                  <Paper key={ep.id} sx={{ bgcolor: '#0D1117', borderRadius: 2, overflow: 'hidden', border: '1px solid #30363d' }}>
                    <Box sx={{ px: 2, py: 1, bgcolor: '#161B22', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: 700, textTransform: 'uppercase' }}>{ep.title} Sample</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#30363d' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#30363d' }} />
                      </Stack>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Typography component="pre" sx={{ fontFamily: 'Fira Code, monospace', fontSize: 13, lineHeight: 1.8, margin: 0, color: '#c9d1d9' }}>
                        {lang === 'javascript' ? ep.js : ep.php}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </>
  );
}
/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-unknown-property */
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Card,
  Stack,
  Container,
  Typography,
  TextField,
  alpha,
  useTheme,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import axios from '../../utils/axios';
// components
import Iconify from '../../components/iconify';
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function PaymentLinkInitializePage() {
  const theme = useTheme();
  const { query } = useRouter();
  const { themeStretch } = useSettingsContext();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // 1. Get Payment Link Details using ?ref={id}
  const getLinkDetails = useCallback(async () => {
    const ref = query.ref;
    if (!ref) return;

    try {
      setLoading(true);
      const response = await axios.get(`/paymentlink/details/${ref}`);
      if (response.data.status) {
        setLinkData(response.data.data);
      } else {
        setError(response.data.message || 'Payment link not found.');
      }
    } catch (err) {
      setError('Could not load payment details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [query.ref]);

  useEffect(() => {
    if (query.ref) getLinkDetails();
  }, [query.ref, getLinkDetails]);

  // 2. Handle Initialization
  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`/paymentlink/initialize`, {
        id: query.ref,
        name: formData.name,
        email: formData.email,
      });

      if (response.data.status && response.data.data.authorization_url) {
        // Redirect to the checkout URL provided by backend
        window.location.href = response.data.data.authorization_url;
      } else {
        alert(response.data.message || 'Initialization failed.');
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress thickness={4} size={40} />
      </Box>
    );

  if (error)
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Iconify icon="solar:danger-bold-duotone" width={64} sx={{ color: 'error.main', mb: 2 }} />
        <Typography variant="h4">{error}</Typography>
        <Button variant="soft" sx={{ mt: 3 }} onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );

  return (
    <>
      <Head>
        <title>Pay {linkData?.merchant?.business_name} | CredDot</title>
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f4f7f9',
          display: 'flex',
          alignItems: 'center',
          py: 5,
        }}
      >
        <Container maxWidth={themeStretch ? false : 'sm'}>
          <Card
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            {/* Merchant Branding */}
            <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Avatar
                src={linkData?.merchant?.logo}
                sx={{ width: 80, height: 80, boxShadow: theme.customShadows.z16 }}
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {linkData?.merchant?.business_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {linkData?.merchant?.contact_email}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

            {/* Payment Link Details */}
            <Box
              sx={{
                mb: 4,
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 2,
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                Payment for
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
                {linkData?.payment_link?.currency}{' '}
                {Number(linkData?.payment_link?.amount).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {linkData?.payment_link?.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {linkData?.payment_link?.description}
              </Typography>
            </Box>

            {/* Initialization Form */}
            <form onSubmit={handleInitialize}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{
                    height: 60,
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    boxShadow: theme.customShadows.primary,
                  }}
                >
                  Pay Now
                </LoadingButton>
              </Stack>
            </form>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ mt: 4, opacity: 0.6 }}
            >
              <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: 'success.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Secure Payment Powered by CredDot
              </Typography>
            </Stack>
          </Card>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              color: 'text.disabled',
              fontWeight: 600,
            }}
          >
            {linkData?.payment_link?.mode === 'test' ? 'TEST MODE' : ''}
          </Typography>
        </Container>
      </Box>
    </>
  );
}

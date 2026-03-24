import { useMemo } from 'react';
import Head from 'next/head';
import * as Yup from 'yup';
// next
import { useRouter } from 'next/router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  Container,
  Typography,
  MenuItem,
  Box,
  Button,
  Grid, // Added the missing Grid import here
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from '../../../components/hook-form';
// utils
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

type FormValuesProps = {
  subject: string;
  priority: string;
  message: string;
};

// Layout definition
TicketCreatePage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------

export default function TicketCreatePage() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const NewTicketSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required').min(5, 'Subject is too short'),
    priority: Yup.string().required('Priority is required'),
    message: Yup.string().required('Message is required').min(10, 'Please provide more details'),
  });

  const defaultValues = useMemo(
    () => ({
      subject: '',
      priority: 'low',
      message: '',
    }),
    []
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewTicketSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const response = await axios.post('/ticket/create', data);

      if (response.data.status) {
        // Response: "Ticket created successfully"
        enqueueSnackbar(response.data.message);
        reset();

        // Navigation: dashboard/ticket/{id}/details
        // Using the ticket_id from the response data
        const ticketId = response.data.data.ticket_id;
        push(`${PATH_DASHBOARD.ticket.root}/${ticketId}/details`);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Error creating ticket', { variant: 'error' });
    }
  };

  return (
    <>
      <Head>
        <title>Create New Ticket | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            onClick={() => push(PATH_DASHBOARD.ticket.history)}
          >
            Back to List
          </Button>
        </Stack>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Create a New Support Ticket
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Describe your issue and we will investigate immediately.
          </Typography>
        </Box>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <RHFTextField
                    name="subject"
                    label="Subject"
                    placeholder="e.g. Unable to fund USD Virtual Card"
                  />

                  <RHFSelect name="priority" label="Priority">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </RHFSelect>

                  <RHFTextField
                    name="message"
                    label="Message"
                    multiline
                    rows={6}
                    placeholder="Describe your issue in detail..."
                  />

                  <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      size="large"
                      loading={isSubmitting}
                      sx={{ px: 5 }}
                    >
                      Submit Ticket
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Container>
    </>
  );
}

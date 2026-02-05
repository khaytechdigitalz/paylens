/* eslint-disable react/jsx-curly-brace-presence */
import { useRouter } from 'next/router';
// @mui
import { Tooltip, Stack, Typography, Link, Box } from '@mui/material';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
//
import AuthRegisterForm from './AuthRegisterForm';

// ----------------------------------------------------------------------

export default function Login() {
  const { method } = useAuthContext();
  const { push } = useRouter();
  return (
    <LoginLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Sign Up to CredDot</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2">Have an Account?</Typography>

          <Link onClick={() => push('/login')} variant="subtitle2">
            Login Here
          </Link>
        </Stack>

        <Tooltip title={method} placement="left">
          <Box
            component="img"
            alt={method}
            src={`/assets/logo/logo.png`}
            sx={{ width: 32, height: 32, position: 'absolute', right: 0 }}
          />
        </Tooltip>
      </Stack>
      <AuthRegisterForm />
 
    </LoginLayout>
  );
}

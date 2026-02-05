// @mui
import { Typography, Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ children, illustration, title }: Props) {
  return (
    <StyledRoot sx={{ display: 'flex' }}>
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 5 },
          ml: { xs: 2, md: 5 },
        }}
      />

      {/* LEFT SIDE: IMAGE SECTION (40%) */}
      <StyledSection
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '40%', // Sets the section to 40%
          maxWidth: '40%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" sx={{ mb: 10, maxWidth: 480, textAlign: 'center' }}>
          {title || ''}
        </Typography>

        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={illustration || '/assets/images/auth/login.png'}
          sx={{ width: '100%', px: 5 }} // Ensure image fits the 40% container
        />

        <StyledSectionBg />
      </StyledSection>

      {/* RIGHT SIDE: FORM CONTENT (60%) */}
      <StyledContent
        sx={{
          width: { xs: '100%', md: '60%' }, // Sets the form area to 60%
          maxWidth: { xs: '100%', md: '60%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 0 }, // Optional: center the form horizontally
        }}
      >
        <Stack sx={{ width: 1, maxWidth: 480 }}>{children}</Stack>
      </StyledContent>
    </StyledRoot>
  );
}

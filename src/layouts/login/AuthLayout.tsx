// @mui
// components
import Logo from '../../components/logo';
//
import { StyledRoot } from './styles';

// ----------------------------------------------------------------------

type Props = { 
  children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
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
      

      {/* RIGHT SIDE: FORM CONTENT (60%) */}
      
    </StyledRoot>
  );
}

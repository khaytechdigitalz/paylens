import { forwardRef } from 'react';
// next
import NextLink from 'next/link';
// @mui
import { Box, Link, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => { 
 

    const logo = (
      <Box
        ref={ref}
        component="img" // Change this from "div" to "img"
        src="/assets/logo/logo.png"
        sx={{
          width: 40,
          height: 40,
          display: 'inline-flex',
          objectFit: 'contain', // Ensures the logo isn't stretched
          ...sx,
        }}
        {...other}
      />
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={NextLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;

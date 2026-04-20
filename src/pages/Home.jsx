import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LogoLink } from '../components/logo/LogoLink';
import { Content } from '../components/content/Content';
import DisplacementSphere from '../components/background/DisplacementSphere';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { SocialIcons } from '../components/content/SocialIcons';
import { SpeedDials } from '../components/speedDial/SpeedDial';

export const Home = () => {
  const theme = useTheme();
  const showSocialIcons = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <DisplacementSphere />
        <LogoLink />
        <Content />
        <ThemeToggle />
        {showSocialIcons ? <SocialIcons /> : <SpeedDials />}
      </Box>
    </>
  );
};

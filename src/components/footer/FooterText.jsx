import React from 'react';
import { Typography, Link } from '@mui/material';
import { TextDecrypt } from '../content/TextDecrypt';
import { HeartIcon } from '../content/SponsorButton';

export const FooterText = () => {
  return (
    <Link
      color='inherit'
      underline='none'
      href='https://github.com/sponsors/duggaraju'
      target='_blank'
      rel='noopener noreferrer'
      sx={(muiTheme) => ({
        position: 'absolute',
        bottom: muiTheme.spacing(6),
        left: muiTheme.spacing(6),
        '&:hover': {
          color: muiTheme.palette.primary.main,
        },
        transition: 'all 0.5s ease',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      })}
    >
      <HeartIcon />
      <Typography variant='body1'>
        <TextDecrypt text={' Sponsor'} />
      </Typography>
    </Link>
  );
};

import React from 'react';
import { Box, Link, Tooltip, IconButton, Zoom } from '@mui/material';
import Resume from '../../settings/resume.json';

export const SocialIcons = () => {
  const socialItems = Resume.basics.profiles.map((socialItem) => (
    <Link
      href={socialItem.url}
      key={socialItem.network.toLowerCase()}
      target='_blank'
      rel='noopener noreferrer'
      underline='none'
      color='inherit'
    >
      <Tooltip
        title={socialItem.username}
        placement='left'
        slots={{ transition: Zoom }}
      >
        <IconButton
          color='inherit'
          aria-label={socialItem.network}
          sx={(muiTheme) => ({
            height: '2.5rem',
            width: '2.5rem',
            display: 'block',
            marginBottom: muiTheme.spacing(2),
          })}
        >
          <i className={socialItem.x_icon} style={{ fontSize: '1.25rem' }}></i>
        </IconButton>
      </Tooltip>
    </Link>
  ));

  return (
    <Box
      sx={(muiTheme) => ({
        position: 'absolute',
        top: muiTheme.spacing(6),
        right: muiTheme.spacing(6),
      })}
    >
      {socialItems}
    </Box>
  );
};

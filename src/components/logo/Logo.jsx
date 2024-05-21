import React from "react";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  svgHover: {
    fill: theme.palette.foreground.default,
    "&:hover": {
      fill: theme.palette.primary.main,
    },
    transition: "all 0.5s ease",
  },
}));

export const Logo = () => {
  const classes = useStyles();

  return (
    <svg
      id="eGQCT6Yf9pz1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      <defs>
        <radialGradient
          id="eGQCT6Yf9pz2-fill"
          cx="0"
          cy="0"
          r="0.5"
          spreadMethod="pad"
          gradientUnits="objectBoundingBox"
          gradientTransform="translate(0.5 0.5)"
        >
          <stop id="eGQCT6Yf9pz2-fill-0" offset="0%" stopColor="#126c7c" />
          <stop id="eGQCT6Yf9pz2-fill-1" offset="100%" stopColor="#ed9383" />
        </radialGradient>
      </defs>
      <text
        dx="0"
        dy="0"
        fontFamily='"Open Sans"'
        fontSize="128"
        fontWeight="600"
        fontStyle="italic"
        transform="matrix(1.733248 0 0 1.668823 8.814286 232.357116)"
        fill="url(#eGQCT6Yf9pz2-fill)"
        strokeWidth="0"
      >
        <tspan y="0" fontWeight="600" strokeWidth="0">
          PD
        </tspan>
      </text>
      <text
        dx="0"
        dy="0"
        fontFamily='"Roboto"'
        fontSize="15"
        fontWeight="400"
        transform="translate(106.058242 139.365575)"
        strokeWidth="0"
      >
        <tspan y="0" fontWeight="400" strokeWidth="0"></tspan>
      </text>
    </svg>
  );
};

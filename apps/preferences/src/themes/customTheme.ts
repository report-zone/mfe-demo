/**
 * Custom Theme
 *
 * A comprehensive Material UI theme based on colors extracted from
 * the custom.svg logo located at design/images/custom.svg
 *
 * Color Palette extracted from SVG:
 * - Primary: #689cc5 (rgb(104, 156, 197)) - Blue from top-right puzzle piece
 * - Secondary: #5e6fa3 (rgb(94, 111, 163)) - Dark Blue from top-left puzzle piece
 * - Dark Accent: #3b4368 (rgb(59, 67, 104)) - Very Dark Blue from bottom-left piece
 * - Light Accent: #93dbe9 (rgb(147, 219, 233)) - Light Cyan from bottom-right piece
 */

import { CustomThemeDefinition } from '../types/theme.types';

// Helper function to lighten a color (simple approximation)
const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(
    255,
    Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent)
  );
  const b = Math.min(255, Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// Helper function to darken a color (simple approximation)
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.floor((num >> 16) * (1 - percent));
  const g = Math.floor(((num >> 8) & 0x00ff) * (1 - percent));
  const b = Math.floor((num & 0x0000ff) * (1 - percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// SVG Colors
const primaryMain = '#689cc5'; // Blue
const secondaryMain = '#5e6fa3'; // Dark Blue/Purple
const darkAccent = '#3b4368'; // Very Dark Blue
const lightAccent = '#93dbe9'; // Light Cyan

export const customThemeDefinition: CustomThemeDefinition = {
  name: 'Custom',
  version: '1.0.0',
  description: 'Professional theme based on Custom brand colors from the logo',
  palette: {
    mode: 'light',
  },
  colors: {
    // Primary color (Blue from SVG)
    primaryMain: primaryMain,
    primaryLight: lightenColor(primaryMain, 0.3),
    primaryDark: darkenColor(primaryMain, 0.2),

    // Secondary color (Dark Blue from SVG)
    secondaryMain: secondaryMain,
    secondaryLight: lightenColor(secondaryMain, 0.3),
    secondaryDark: darkenColor(secondaryMain, 0.2),

    // Status colors using theme colors
    errorMain: '#d32f2f',
    warningMain: '#ed6c02',
    infoMain: lightAccent, // Use light cyan for info
    successMain: '#2e7d32',

    // Background colors - light and clean
    backgroundDefault: '#f8f9fa',
    backgroundPaper: '#ffffff',

    // Text colors
    textPrimary: darkAccent, // Use dark blue for text
    textSecondary: 'rgba(59, 67, 104, 0.7)',
  },
  componentOverrides: {
    button: {
      borderRadius: 8,
      textTransform: 'none', // More modern look
    },
    paper: {
      borderRadius: 8,
      elevation: 2,
    },
    card: {
      borderRadius: 12,
      elevation: 2,
    },
    textField: {
      borderRadius: 8,
    },
    appBar: {
      elevation: 0, // Flat AppBar for modern look
    },
    drawer: {
      width: 260,
    },
    alert: {
      borderRadius: 8,
    },
    dialog: {
      borderRadius: 12,
    },
    tooltip: {
      fontSize: 13,
    },
    chip: {
      borderRadius: 20,
    },
    list: {
      padding: 8,
    },
    typography: {
      h1FontSize: 48,
      h2FontSize: 36,
      h3FontSize: 28,
      bodyFontSize: 14,
    },
  },
  muiComponentOverrides: {
    // Typography Components
    MuiTypography: {
      styleOverrides: {
        root: {
          color: darkAccent,
        },
        h1: {
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: darkAccent,
        },
        h2: {
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: darkAccent,
        },
        h3: {
          fontWeight: 600,
          color: darkAccent,
        },
        h4: {
          fontWeight: 600,
          color: darkAccent,
        },
        h5: {
          fontWeight: 600,
          color: secondaryMain,
        },
        h6: {
          fontWeight: 600,
          color: secondaryMain,
        },
        subtitle1: {
          fontWeight: 500,
          color: secondaryMain,
        },
        subtitle2: {
          fontWeight: 500,
          color: 'rgba(59, 67, 104, 0.8)',
        },
      },
    },

    // Accordion Components
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '8px !important',
          border: `1px solid ${lightenColor(primaryMain, 0.7)}`,
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '8px 0',
            boxShadow: `0 2px 8px ${lightenColor(primaryMain, 0.8)}`,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: lightenColor(primaryMain, 0.9),
          borderRadius: '8px',
          '&.Mui-expanded': {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: lightenColor(primaryMain, 0.85),
          },
        },
        content: {
          color: darkAccent,
          fontWeight: 600,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px',
          backgroundColor: '#ffffff',
        },
      },
    },

    // AppBar Components
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: `linear-gradient(135deg, ${lightenColor(secondaryMain, 0.6)} 0%, ${secondaryMain} 100%)`,
          boxShadow: '0 2px 8px rgba(59, 67, 104, 0.15)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px',
        },
      },
    },

    // Menu Components
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '2px',
          boxShadow: '0 4px 20px rgba(59, 67, 104, 0.15)',
          border: `1px solid ${lightenColor(primaryMain, 0.8)}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          borderRadius: '4px',
          margin: '2px 4px',
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.9),
          },
          '&.Mui-selected': {
            backgroundColor: lightenColor(primaryMain, 0.85),
            '&:hover': {
              backgroundColor: lightenColor(primaryMain, 0.8),
            },
          },
        },
      },
    },

    // Button Components
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(104, 156, 197, 0.25)',
          },
        },
        contained: {
          backgroundColor: primaryMain,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: darkenColor(primaryMain, 0.15),
          },
        },
        containedSecondary: {
          backgroundColor: secondaryMain,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: darkenColor(secondaryMain, 0.15),
          },
        },
        outlined: {
          borderColor: primaryMain,
          color: primaryMain,
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: lightenColor(primaryMain, 0.95),
          },
        },
        text: {
          color: primaryMain,
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.95),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.9),
          },
        },
      },
    },

    // Card Components
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(59, 67, 104, 0.08)',
          border: `1px solid ${lightenColor(primaryMain, 0.85)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(104, 156, 197, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: lightenColor(primaryMain, 0.95),
          borderBottom: `1px solid ${lightenColor(primaryMain, 0.85)}`,
        },
        title: {
          color: darkAccent,
          fontWeight: 600,
        },
        subheader: {
          color: secondaryMain,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
        },
      },
    },

    // Paper Components
    MuiPaper: {},

    // Drawer Components
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f2f7fb',
          borderRight: `1px solid ${lightenColor(primaryMain, 0.85)}`,
          boxShadow: '2px 0 8px rgba(59, 67, 104, 0.08)',
        },
      },
    },

    // Checkbox Components
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: primaryMain,
          '&.Mui-checked': {
            color: primaryMain,
          },
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.95),
          },
        },
      },
    },

    // Switch Components
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 48,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(22px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: primaryMain,
              opacity: 1,
              border: 0,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 26 / 2,
          backgroundColor: lightenColor(darkAccent, 0.7),
          opacity: 1,
        },
      },
    },

    // Slider Components
    MuiSlider: {
      styleOverrides: {
        root: {
          color: primaryMain,
          height: 6,
        },
        thumb: {
          height: 20,
          width: 20,
          backgroundColor: '#fff',
          border: `3px solid ${primaryMain}`,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${lightenColor(primaryMain, 0.84)}`,
          },
          '&.Mui-active': {
            boxShadow: `0 0 0 12px ${lightenColor(primaryMain, 0.84)}`,
          },
        },
        track: {
          border: 'none',
          height: 6,
        },
        rail: {
          opacity: 0.3,
          backgroundColor: primaryMain,
          height: 6,
        },
        mark: {
          backgroundColor: primaryMain,
          height: 8,
          width: 2,
        },
        markActive: {
          backgroundColor: primaryMain,
        },
      },
    },

    // List Components
    MuiList: {
      styleOverrides: {
        root: {
          padding: '8px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          marginBottom: '2px',
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.95),
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.9),
          },
          '&.Mui-selected': {
            backgroundColor: lightenColor(primaryMain, 0.85),
            '&:hover': {
              backgroundColor: lightenColor(primaryMain, 0.8),
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: secondaryMain,
          minWidth: '40px',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: darkAccent,
          fontWeight: 500,
        },
        secondary: {
          color: 'rgba(59, 67, 104, 0.7)',
        },
      },
    },

    // Chip Components
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: lightenColor(primaryMain, 0.85),
          color: darkAccent,
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.75),
          },
        },
        outlined: {
          borderColor: primaryMain,
          color: primaryMain,
          borderWidth: '2px',
          '&:hover': {
            backgroundColor: lightenColor(primaryMain, 0.95),
          },
        },
        colorPrimary: {
          backgroundColor: primaryMain,
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: secondaryMain,
          color: '#ffffff',
        },
        deleteIcon: {
          color: 'rgba(59, 67, 104, 0.7)',
          '&:hover': {
            color: darkAccent,
          },
        },
      },
    },
  },
  createdAt: new Date().toISOString(),
};

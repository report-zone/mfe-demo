import React, { useState } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Tabs,
  Tab,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog as ConfirmDialog,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Editor from '@monaco-editor/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ColorPicker from './ColorPicker';
import { ThemeEditorState, CustomThemeDefinition } from '../types/theme.types';

interface ThemeEditorDialogProps {
  open: boolean;
  onClose: () => void;
  initialTheme?: ThemeEditorState;
}

const defaultEditorState: ThemeEditorState = {
  name: 'Custom Theme',
  version: '1.0.0',
  description: '',
  primary: '#1976d2',
  primaryLight: '#42a5f5',
  primaryDark: '#1565c0',
  secondary: '#dc004e',
  secondaryLight: '#ff4081',
  secondaryDark: '#9a0036',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
  background: '#ffffff',
  paper: '#f5f5f5',
  textPrimary: '#000000',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  mode: 'light',
  borderRadius: 4,
  fontSize: 14,
  padding: 8,
  buttonTextTransform: 'uppercase',
  paperElevation: 1,
  cardElevation: 1,
  appBarElevation: 4,
  drawerWidth: 240,
  dialogBorderRadius: 8,
  chipBorderRadius: 16,
  listPadding: 8,
  tooltipFontSize: 12,
  h1FontSize: 96,
  h2FontSize: 60,
  h3FontSize: 48,
  bodyFontSize: 16,
  jsonConfig: JSON.stringify({
    MuiAccordion: {},
    MuiAccordionActions: {},
    MuiAccordionDetails: {},
    MuiAccordionSummary: {},
    MuiAlert: {},
    MuiAlertTitle: {},
    MuiAppBar: {},
    MuiAutocomplete: {},
    MuiAvatar: {},
    MuiAvatarGroup: {},
    MuiBackdrop: {},
    MuiBadge: {},
    MuiBottomNavigation: {},
    MuiBottomNavigationAction: {},
    MuiBreadcrumbs: {},
    MuiButton: {},
    MuiButtonBase: {},
    MuiButtonGroup: {},
    MuiCard: {},
    MuiCardActionArea: {},
    MuiCardActions: {},
    MuiCardContent: {},
    MuiCardHeader: {},
    MuiCardMedia: {},
    MuiCheckbox: {},
    MuiChip: {},
    MuiCircularProgress: {},
    MuiCollapse: {},
    MuiContainer: {},
    MuiCssBaseline: {},
    MuiDialog: {},
    MuiDialogActions: {},
    MuiDialogContent: {},
    MuiDialogContentText: {},
    MuiDialogTitle: {},
    MuiDivider: {},
    MuiDrawer: {},
    MuiFab: {},
    MuiFilledInput: {},
    MuiFormControl: {},
    MuiFormControlLabel: {},
    MuiFormGroup: {},
    MuiFormHelperText: {},
    MuiFormLabel: {},
    MuiGrid: {},
    MuiIcon: {},
    MuiIconButton: {},
    MuiImageList: {},
    MuiImageListItem: {},
    MuiImageListItemBar: {},
    MuiInput: {},
    MuiInputAdornment: {},
    MuiInputBase: {},
    MuiInputLabel: {},
    MuiLinearProgress: {},
    MuiLink: {},
    MuiList: {},
    MuiListItem: {},
    MuiListItemAvatar: {},
    MuiListItemButton: {},
    MuiListItemIcon: {},
    MuiListItemSecondaryAction: {},
    MuiListItemText: {},
    MuiListSubheader: {},
    MuiMenu: {},
    MuiMenuItem: {},
    MuiMenuList: {},
    MuiMobileStepper: {},
    MuiModal: {},
    MuiNativeSelect: {},
    MuiOutlinedInput: {},
    MuiPagination: {},
    MuiPaginationItem: {},
    MuiPaper: {},
    MuiPopover: {},
    MuiPopper: {},
    MuiRadio: {},
    MuiRadioGroup: {},
    MuiRating: {},
    MuiScopedCssBaseline: {},
    MuiSelect: {},
    MuiSkeleton: {},
    MuiSlider: {},
    MuiSnackbar: {},
    MuiSnackbarContent: {},
    MuiSpeedDial: {},
    MuiSpeedDialAction: {},
    MuiSpeedDialIcon: {},
    MuiStack: {},
    MuiStep: {},
    MuiStepButton: {},
    MuiStepConnector: {},
    MuiStepContent: {},
    MuiStepIcon: {},
    MuiStepLabel: {},
    MuiStepper: {},
    MuiSvgIcon: {},
    MuiSwitch: {},
    MuiTab: {},
    MuiTable: {},
    MuiTableBody: {},
    MuiTableCell: {},
    MuiTableContainer: {},
    MuiTableFooter: {},
    MuiTableHead: {},
    MuiTablePagination: {},
    MuiTableRow: {},
    MuiTableSortLabel: {},
    MuiTabs: {},
    MuiTextField: {},
    MuiToggleButton: {},
    MuiToggleButtonGroup: {},
    MuiToolbar: {},
    MuiTooltip: {},
    MuiTypography: {},
  }, null, 2),
};

const ThemeEditorDialog: React.FC<ThemeEditorDialogProps> = ({ open, onClose, initialTheme }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fullThemeJsonError, setFullThemeJsonError] = useState<string>('');
  const [monacoSettings, setMonacoSettings] = useState({ theme: 'vs-light' });
  const [showMonacoSettings, setShowMonacoSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [confirmClose, setConfirmClose] = useState(false);

  const [editorState, setEditorState] = useState<ThemeEditorState>(defaultEditorState);
  const [fullThemeJson, setFullThemeJson] = useState<string>('');

  // Convert editorState to full theme JSON (matching themeFormat.json)
  const convertEditorStateToFullThemeJson = (state: ThemeEditorState): string => {
    try {
      let muiOverrides = {};
      try {
        muiOverrides = JSON.parse(state.jsonConfig);
      } catch (e) {
        console.warn(`Failed to parse MUI overrides JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      const now = new Date().toISOString();
      const fullTheme = {
        name: state.name,
        version: state.version,
        description: state.description || '',
        createdAt: now,
        modifiedAt: now,
        colors: {
          primaryMain: state.primary,
          primaryLight: state.primaryLight || '#42a5f5',
          primaryDark: state.primaryDark || '#1565c0',
          secondaryMain: state.secondary,
          secondaryLight: state.secondaryLight || '#ff4081',
          secondaryDark: state.secondaryDark || '#9a0036',
          errorMain: state.error,
          warningMain: state.warning,
          infoMain: state.info,
          successMain: state.success,
          backgroundDefault: state.background,
          backgroundPaper: state.paper,
          textPrimary: state.textPrimary,
          textSecondary: state.textSecondary,
        },
        overrides: muiOverrides,
      };

      return JSON.stringify(fullTheme, null, 2);
    } catch (error) {
      console.error(`Error converting editor state to full theme JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return '{}';
    }
  };

  // Convert full theme JSON back to editorState
  const convertFullThemeJsonToEditorState = (jsonString: string): ThemeEditorState | null => {
    try {
      const parsed = JSON.parse(jsonString);
      
      return {
        name: parsed.name || 'Custom Theme',
        version: parsed.version || '1.0.0',
        description: parsed.description || '',
        primary: parsed.colors?.primaryMain || '#1976d2',
        primaryLight: parsed.colors?.primaryLight || '#42a5f5',
        primaryDark: parsed.colors?.primaryDark || '#1565c0',
        secondary: parsed.colors?.secondaryMain || '#dc004e',
        secondaryLight: parsed.colors?.secondaryLight || '#ff4081',
        secondaryDark: parsed.colors?.secondaryDark || '#9a0036',
        error: parsed.colors?.errorMain || '#d32f2f',
        warning: parsed.colors?.warningMain || '#ed6c02',
        info: parsed.colors?.infoMain || '#0288d1',
        success: parsed.colors?.successMain || '#2e7d32',
        background: parsed.colors?.backgroundDefault || '#ffffff',
        paper: parsed.colors?.backgroundPaper || '#f5f5f5',
        textPrimary: parsed.colors?.textPrimary || '#000000',
        textSecondary: parsed.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
        mode: 'light',
        borderRadius: 4,
        fontSize: 14,
        padding: 8,
        buttonTextTransform: 'uppercase',
        paperElevation: 1,
        cardElevation: 1,
        appBarElevation: 4,
        drawerWidth: 240,
        dialogBorderRadius: 8,
        chipBorderRadius: 16,
        listPadding: 8,
        tooltipFontSize: 12,
        h1FontSize: 96,
        h2FontSize: 60,
        h3FontSize: 48,
        bodyFontSize: 16,
        jsonConfig: JSON.stringify(parsed.overrides || {}, null, 2),
      };
    } catch (error) {
      console.error(`Error parsing full theme JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      const initialState = initialTheme || defaultEditorState;
      setEditorState(initialState);
      setFullThemeJson(convertEditorStateToFullThemeJson(initialState));
      setActiveTab(0);
      setHasUnsavedChanges(false);
      setFullThemeJsonError('');
    }
  }, [open, initialTheme]);

  // Generate theme from editor state for live preview
  const generateTheme = () => {
    try {
      // Parse muiComponentOverrides from jsonConfig
      let muiOverrides = {};
      try {
        muiOverrides = JSON.parse(editorState.jsonConfig);
      } catch (e) {
        console.warn('Invalid JSON config for MUI overrides');
      }

      const themeConfig = {
        palette: {
          mode: editorState.mode,
          primary: {
            main: editorState.primary,
            light: editorState.primaryLight,
            dark: editorState.primaryDark,
          },
          secondary: {
            main: editorState.secondary,
            light: editorState.secondaryLight,
            dark: editorState.secondaryDark,
          },
          error: {
            main: editorState.error,
          },
          warning: {
            main: editorState.warning,
          },
          info: {
            main: editorState.info,
          },
          success: {
            main: editorState.success,
          },
          background: {
            default: editorState.background,
            paper: editorState.paper,
          },
          text: {
            primary: editorState.textPrimary,
            secondary: editorState.textSecondary,
          },
        },
        shape: {
          borderRadius: editorState.borderRadius || 4,
        },
        typography: {
          fontSize: editorState.bodyFontSize || 16,
          h1: {
            fontSize: `${editorState.h1FontSize || 96}px`,
          },
          h2: {
            fontSize: `${editorState.h2FontSize || 60}px`,
          },
          h3: {
            fontSize: `${editorState.h3FontSize || 48}px`,
          },
          body1: {
            fontSize: `${editorState.bodyFontSize || 16}px`,
          },
        },
        spacing: editorState.padding || 8,
        components: muiOverrides,
      };

      return createTheme(themeConfig);
    } catch (error) {
      console.error('Error generating theme:', error);
      return createTheme();
    }
  };

  const previewTheme = generateTheme();

  const handleFieldChange = (field: keyof ThemeEditorState, value: string | number) => {
    // Convert numeric string values to numbers for appropriate fields
    let processedValue: string | number = value;
    if (typeof value === 'string') {
      if (field === 'borderRadius' || field === 'padding' || field === 'paperElevation' || 
          field === 'cardElevation' || field === 'appBarElevation' || field === 'drawerWidth' || 
          field === 'dialogBorderRadius' || field === 'chipBorderRadius' || field === 'listPadding' ||
          field === 'tooltipFontSize' || field === 'h1FontSize' || field === 'h2FontSize' || 
          field === 'h3FontSize' || field === 'bodyFontSize') {
        const numValue = parseInt(value, 10);
        processedValue = isNaN(numValue) ? 0 : numValue;
      }
    }
    const newState = { ...editorState, [field]: processedValue };
    setEditorState(newState);
    setFullThemeJson(convertEditorStateToFullThemeJson(newState));
    setHasUnsavedChanges(true);
  };

  const handleFullThemeJsonChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFullThemeJson(value);
      setHasUnsavedChanges(true);

      // Validate and sync to editorState
      try {
        const newState = convertFullThemeJsonToEditorState(value);
        if (newState) {
          setEditorState(newState);
          setFullThemeJsonError('');
        }
      } catch (e) {
        setFullThemeJsonError(e instanceof Error ? e.message : 'Invalid JSON');
      }
    }
  };

  const exportToCustomThemeDefinition = (): CustomThemeDefinition => {
    // Parse muiComponentOverrides from jsonConfig
    let muiOverrides = {};
    try {
      muiOverrides = JSON.parse(editorState.jsonConfig);
    } catch (e) {
      console.warn('Invalid JSON config for MUI overrides');
    }

    return {
      name: editorState.name,
      version: editorState.version,
      description: editorState.description,
      colors: {
        primaryMain: editorState.primary,
        primaryLight: editorState.primaryLight || '#42a5f5',
        primaryDark: editorState.primaryDark || '#1565c0',
        secondaryMain: editorState.secondary,
        secondaryLight: editorState.secondaryLight || '#ff4081',
        secondaryDark: editorState.secondaryDark || '#9a0036',
        errorMain: editorState.error,
        warningMain: editorState.warning,
        infoMain: editorState.info,
        successMain: editorState.success,
        backgroundDefault: editorState.background,
        backgroundPaper: editorState.paper,
        textPrimary: editorState.textPrimary,
        textSecondary: editorState.textSecondary,
      },
      componentOverrides: {
        button: {
          borderRadius: editorState.borderRadius || 4,
          textTransform: editorState.buttonTextTransform || 'uppercase',
        },
        paper: {
          borderRadius: editorState.borderRadius || 4,
          elevation: editorState.paperElevation || 1,
        },
        card: {
          borderRadius: editorState.borderRadius || 4,
          elevation: editorState.cardElevation || 1,
        },
        textField: {
          borderRadius: editorState.borderRadius || 4,
        },
        appBar: {
          elevation: editorState.appBarElevation || 4,
        },
        drawer: {
          width: editorState.drawerWidth || 240,
        },
        alert: {
          borderRadius: editorState.borderRadius || 4,
        },
        dialog: {
          borderRadius: editorState.dialogBorderRadius || 8,
        },
        tooltip: {
          fontSize: editorState.tooltipFontSize || 12,
        },
        chip: {
          borderRadius: editorState.chipBorderRadius || 16,
        },
        list: {
          padding: editorState.listPadding || 8,
        },
        typography: {
          h1FontSize: editorState.h1FontSize || 96,
          h2FontSize: editorState.h2FontSize || 60,
          h3FontSize: editorState.h3FontSize || 48,
          bodyFontSize: editorState.bodyFontSize || 16,
        },
      },
      muiComponentOverrides: muiOverrides,
      createdAt: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    if (fullThemeJsonError) {
      setSnackbar({ open: true, message: 'Please fix JSON errors before saving', severity: 'error' });
      return;
    }

    // Create custom theme definition
    const themeDefinition = exportToCustomThemeDefinition();

    // Download as JSON file
    const sanitizeFilename = (name: string): string => {
      return name.toLowerCase()
        .replace(/[/\\?%*:|"<>]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    const blob = new Blob([JSON.stringify(themeDefinition, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(editorState.name)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasUnsavedChanges(false);
    setSnackbar({ open: true, message: 'Theme saved to file system!', severity: 'success' });
    setTimeout(() => onClose(), 1000);
  };

  const handleResetToDefaults = () => {
    setEditorState(defaultEditorState);
    setFullThemeJson(convertEditorStateToFullThemeJson(defaultEditorState));
    setHasUnsavedChanges(true);
    setSnackbar({ open: true, message: 'Reset to default values!', severity: 'info' });
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setConfirmClose(false);
    onClose();
  };

  const handleLoadTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            const result = event.target?.result;
            if (typeof result === 'string') {
              const config: CustomThemeDefinition = JSON.parse(result);
              
              // Load from new format
              setEditorState({
                name: config.name || 'Loaded Theme',
                version: config.version || '1.0.0',
                description: config.description || '',
                primary: config.colors?.primaryMain || '#1976d2',
                primaryLight: config.colors?.primaryLight || '#42a5f5',
                primaryDark: config.colors?.primaryDark || '#1565c0',
                secondary: config.colors?.secondaryMain || '#dc004e',
                secondaryLight: config.colors?.secondaryLight || '#ff4081',
                secondaryDark: config.colors?.secondaryDark || '#9a0036',
                error: config.colors?.errorMain || '#d32f2f',
                warning: config.colors?.warningMain || '#ed6c02',
                info: config.colors?.infoMain || '#0288d1',
                success: config.colors?.successMain || '#2e7d32',
                background: config.colors?.backgroundDefault || '#ffffff',
                paper: config.colors?.backgroundPaper || '#f5f5f5',
                textPrimary: config.colors?.textPrimary || '#000000',
                textSecondary: config.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
                mode: 'light',
                borderRadius: config.componentOverrides?.button?.borderRadius || 4,
                fontSize: 14,
                padding: 8,
                buttonTextTransform: config.componentOverrides?.button?.textTransform || 'uppercase',
                paperElevation: config.componentOverrides?.paper?.elevation || 1,
                cardElevation: config.componentOverrides?.card?.elevation || 1,
                appBarElevation: config.componentOverrides?.appBar?.elevation || 4,
                drawerWidth: config.componentOverrides?.drawer?.width || 240,
                dialogBorderRadius: config.componentOverrides?.dialog?.borderRadius || 8,
                chipBorderRadius: config.componentOverrides?.chip?.borderRadius || 16,
                listPadding: config.componentOverrides?.list?.padding || 8,
                tooltipFontSize: config.componentOverrides?.tooltip?.fontSize || 12,
                h1FontSize: config.componentOverrides?.typography?.h1FontSize || 96,
                h2FontSize: config.componentOverrides?.typography?.h2FontSize || 60,
                h3FontSize: config.componentOverrides?.typography?.h3FontSize || 48,
                bodyFontSize: config.componentOverrides?.typography?.bodyFontSize || 16,
                jsonConfig: JSON.stringify(config.muiComponentOverrides || {}, null, 2),
              });
              setHasUnsavedChanges(true);
              setSnackbar({ open: true, message: 'Theme loaded successfully!', severity: 'success' });
            }
          } catch (error) {
            setSnackbar({ open: true, message: 'Error loading theme file', severity: 'error' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Theme Editor
          </Typography>
          <Button color="inherit" startIcon={<RestartAltIcon />} onClick={handleResetToDefaults}>
            Reset to Default
          </Button>
          <Button color="inherit" startIcon={<UploadFileIcon />} onClick={handleLoadTheme}>
            Load Theme
          </Button>
          <Button color="inherit" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Theme Name"
              value={editorState.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Version"
              value={editorState.version}
              onChange={(e) => handleFieldChange('version', e.target.value)}
              placeholder="e.g., 1.0.0"
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          label="Theme Description"
          value={editorState.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          multiline
          rows={2}
          placeholder="Describe your theme..."
          sx={{ mt: 2, mb: 3 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', overflow: 'auto' }}>
              <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="scrollable">
                <Tab label="Primary" />
                <Tab label="Secondary" />
                <Tab label="Status" />
                <Tab label="Background" />
                <Tab label="Components" />
                <Tab label="Full Theme JSON" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <ColorPicker
                      label="Primary Main"
                      value={editorState.primary}
                      onChange={(v) => handleFieldChange('primary', v)}
                    />
                    <ColorPicker
                      label="Primary Light"
                      value={editorState.primaryLight || '#42a5f5'}
                      onChange={(v) => handleFieldChange('primaryLight', v)}
                    />
                    <ColorPicker
                      label="Primary Dark"
                      value={editorState.primaryDark || '#1565c0'}
                      onChange={(v) => handleFieldChange('primaryDark', v)}
                    />
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <ColorPicker
                      label="Secondary Main"
                      value={editorState.secondary}
                      onChange={(v) => handleFieldChange('secondary', v)}
                    />
                    <ColorPicker
                      label="Secondary Light"
                      value={editorState.secondaryLight || '#f73378'}
                      onChange={(v) => handleFieldChange('secondaryLight', v)}
                    />
                    <ColorPicker
                      label="Secondary Dark"
                      value={editorState.secondaryDark || '#9a0036'}
                      onChange={(v) => handleFieldChange('secondaryDark', v)}
                    />
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <ColorPicker
                      label="Error Color"
                      value={editorState.error}
                      onChange={(v) => handleFieldChange('error', v)}
                    />
                    <ColorPicker
                      label="Warning Color"
                      value={editorState.warning}
                      onChange={(v) => handleFieldChange('warning', v)}
                    />
                    <ColorPicker
                      label="Info Color"
                      value={editorState.info}
                      onChange={(v) => handleFieldChange('info', v)}
                    />
                    <ColorPicker
                      label="Success Color"
                      value={editorState.success}
                      onChange={(v) => handleFieldChange('success', v)}
                    />
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <ColorPicker
                      label="Background Color"
                      value={editorState.background}
                      onChange={(v) => handleFieldChange('background', v)}
                    />
                    <ColorPicker
                      label="Paper Color"
                      value={editorState.paper}
                      onChange={(v) => handleFieldChange('paper', v)}
                    />
                    <ColorPicker
                      label="Text Primary Color"
                      value={editorState.textPrimary}
                      onChange={(v) => handleFieldChange('textPrimary', v)}
                    />
                    <ColorPicker
                      label="Text Secondary Color"
                      value={editorState.textSecondary}
                      onChange={(v) => handleFieldChange('textSecondary', v)}
                    />
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Component Configuration
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Button Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Border Radius (px)"
                      value={editorState.borderRadius || 4}
                      onChange={(e) => handleFieldChange('borderRadius', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Text Transform</InputLabel>
                      <Select
                        value={editorState.buttonTextTransform || 'uppercase'}
                        label="Text Transform"
                        onChange={(e) => handleFieldChange('buttonTextTransform', e.target.value)}
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="uppercase">Uppercase</MenuItem>
                        <MenuItem value="lowercase">Lowercase</MenuItem>
                        <MenuItem value="capitalize">Capitalize</MenuItem>
                      </Select>
                    </FormControl>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Paper & Card Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Paper Elevation"
                      value={editorState.paperElevation || 1}
                      onChange={(e) => handleFieldChange('paperElevation', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Card Elevation"
                      value={editorState.cardElevation || 1}
                      onChange={(e) => handleFieldChange('cardElevation', e.target.value)}
                      sx={{ mb: 3 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Other Components
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="App Bar Elevation"
                      value={editorState.appBarElevation || 4}
                      onChange={(e) => handleFieldChange('appBarElevation', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Drawer Width (px)"
                      value={editorState.drawerWidth || 240}
                      onChange={(e) => handleFieldChange('drawerWidth', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Dialog Border Radius (px)"
                      value={editorState.dialogBorderRadius || 8}
                      onChange={(e) => handleFieldChange('dialogBorderRadius', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Chip Border Radius (px)"
                      value={editorState.chipBorderRadius || 16}
                      onChange={(e) => handleFieldChange('chipBorderRadius', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="List Padding (px)"
                      value={editorState.listPadding || 8}
                      onChange={(e) => handleFieldChange('listPadding', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Tooltip Font Size (px)"
                      value={editorState.tooltipFontSize || 12}
                      onChange={(e) => handleFieldChange('tooltipFontSize', e.target.value)}
                      sx={{ mb: 3 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Typography Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="H1 Font Size (px)"
                      value={editorState.h1FontSize || 96}
                      onChange={(e) => handleFieldChange('h1FontSize', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="H2 Font Size (px)"
                      value={editorState.h2FontSize || 60}
                      onChange={(e) => handleFieldChange('h2FontSize', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="H3 Font Size (px)"
                      value={editorState.h3FontSize || 48}
                      onChange={(e) => handleFieldChange('h3FontSize', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Body Font Size (px)"
                      value={editorState.bodyFontSize || 16}
                      onChange={(e) => handleFieldChange('bodyFontSize', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      For advanced MUI component overrides, use the Full Theme JSON tab.
                    </Typography>
                  </Box>
                )}

                {activeTab === 5 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Full Theme JSON Editor</Typography>
                      <IconButton onClick={() => setShowMonacoSettings(!showMonacoSettings)}>
                        <SettingsIcon />
                      </IconButton>
                    </Box>

                    {showMonacoSettings && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setMonacoSettings({
                              theme: monacoSettings.theme === 'vs-light' ? 'vs-dark' : 'vs-light',
                            })
                          }
                        >
                          Toggle Theme ({monacoSettings.theme})
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
                      <Editor
                        height="500px"
                        language="json"
                        value={fullThemeJson}
                        onChange={handleFullThemeJsonChange}
                        theme={monacoSettings.theme}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          formatOnPaste: true,
                          formatOnType: true,
                        }}
                      />
                    </Box>

                    {fullThemeJsonError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {fullThemeJsonError}
                      </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      This editor shows the complete theme in the format matching themeFormat.json. 
                      All changes made here are immediately reflected in the other tabs and the live preview. 
                      Similarly, changes in other tabs update this JSON view.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Live Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <ThemeProvider theme={previewTheme}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h4" gutterBottom>
                    Theme Preview
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    This preview shows how your theme will look in the application.
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary">
                      Primary
                    </Button>
                    <Button variant="contained" color="secondary">
                      Secondary
                    </Button>
                    <Button variant="outlined">Outlined</Button>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <TextField fullWidth label="Text Field" />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success">Success Alert</Alert>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="error">Error Alert</Alert>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning">Warning Alert</Alert>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info">Info Alert</Alert>
                  </Box>
                </Box>
              </ThemeProvider>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Confirm Close Dialog */}
      <ConfirmDialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to close without saving?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Cancel</Button>
          <Button onClick={handleConfirmClose} color="error" variant="contained">
            Close Without Saving
          </Button>
        </DialogActions>
      </ConfirmDialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ThemeEditorDialog;

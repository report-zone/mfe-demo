import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useThemeContext } from '../context/ThemeContext';
import ThemeEditorDialog from './ThemeEditorDialog';
import ComponentShowcase from './ComponentShowcase';

const ThemesTab: React.FC = () => {
  const { themes, setTheme, currentTheme, addCustomTheme, loadThemesFromStorage } =
    useThemeContext();
  const [editorOpen, setEditorOpen] = useState(false);

  const handleCreateTheme = () => {
    setEditorOpen(true);
  };

  const handleLoadTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const config = JSON.parse(event.target.result);
            const theme = {
              id: `loaded-${Date.now()}`,
              name: config.name || file.name.replace('.json', ''),
              theme: config,
              isCustom: true,
              themeConfig: config,
            };
            addCustomTheme(theme);
            loadThemesFromStorage();
          } catch (error) {
            alert('Error loading theme file. Please ensure it is a valid JSON file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Themes</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTheme}
            >
              Create Custom Theme
            </Button>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleLoadTheme}>
              Load Theme
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Choose from default themes or create your own custom theme.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {themes.map((theme) => (
            <Grid item xs={12} sm={6} md={4} key={theme.id}>
              <Card
                variant="outlined"
                sx={{
                  border: currentTheme.id === theme.id ? '2px solid' : '1px solid',
                  borderColor: currentTheme.id === theme.id ? 'primary.main' : 'divider',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {theme.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {theme.isCustom ? 'Custom Theme' : 'Default Theme'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant={currentTheme.id === theme.id ? 'contained' : 'outlined'}
                    onClick={() => setTheme(theme)}
                  >
                    {currentTheme.id === theme.id ? 'Active' : 'Select'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <ComponentShowcase />
        </Box>
      </Paper>

      <ThemeEditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} />
    </Box>
  );
};

export default ThemesTab;

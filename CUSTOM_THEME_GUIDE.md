# Custom Theme System Guide

## Overview
The MFE Demo application now includes a comprehensive custom theme system that allows users to create, manage, and apply custom themes across the entire application.

## Theme JSON Format

Custom themes follow a standardized JSON format:

```json
{
  "name": "Theme Name",
  "version": "1.0.0",
  "description": "Optional theme description",
  "colors": {
    "primaryMain": "#1976d2",
    "primaryLight": "#42a5f5",
    "primaryDark": "#1565c0",
    "secondaryMain": "#dc004e",
    "secondaryLight": "#ff4081",
    "secondaryDark": "#9a0036",
    "errorMain": "#d32f2f",
    "warningMain": "#ed6c02",
    "infoMain": "#0288d1",
    "successMain": "#2e7d32",
    "backgroundDefault": "#ffffff",
    "backgroundPaper": "#f5f5f5",
    "textPrimary": "#000000",
    "textSecondary": "rgba(0, 0, 0, 0.6)"
  },
  "componentOverrides": {
    "button": {
      "borderRadius": 4,
      "textTransform": "uppercase"
    },
    "paper": {
      "borderRadius": 4,
      "elevation": 1
    },
    "card": {
      "borderRadius": 4,
      "elevation": 1
    },
    "textField": {
      "borderRadius": 4
    },
    "appBar": {
      "elevation": 4
    },
    "drawer": {
      "width": 240
    },
    "alert": {
      "borderRadius": 4
    },
    "dialog": {
      "borderRadius": 8
    },
    "tooltip": {
      "fontSize": 12
    },
    "chip": {
      "borderRadius": 16
    },
    "list": {
      "padding": 8
    },
    "typography": {
      "h1FontSize": 96,
      "h2FontSize": 60,
      "h3FontSize": 48,
      "bodyFontSize": 16
    }
  },
  "muiComponentOverrides": {
    "MuiButton": {
      "styleOverrides": {
        "root": {
          "borderRadius": "4px",
          "textTransform": "uppercase"
        }
      }
    },
    "MuiCard": {
      "styleOverrides": {
        "root": {
          "borderRadius": "4px"
        }
      },
      "defaultProps": {
        "elevation": 1
      }
    }
  },
  "createdAt": "2026-01-15T21:35:41.010Z"
}
```

## Using the Theme Editor

### Creating a New Theme

1. Navigate to the Preferences page
2. Go to the "Themes" tab
3. Click the "Create Custom Theme" button
4. The Theme Editor dialog opens with the following sections:

#### Theme Information
- **Theme Name**: Enter a name for your theme
- **Version**: Specify a version number (e.g., 1.0.0)
- **Description**: Optional description of your theme

#### Editing Options

The theme editor provides several tabs:

1. **Primary Tab**: Edit primary color variants
   - Primary Main
   - Primary Light
   - Primary Dark

2. **Secondary Tab**: Edit secondary color variants
   - Secondary Main
   - Secondary Light
   - Secondary Dark

3. **Status Tab**: Edit status colors
   - Error Color
   - Warning Color
   - Info Color
   - Success Color

4. **Background Tab**: Edit background colors
   - Background Color
   - Paper Color
   - Text Primary Color
   - Text Secondary Color

5. **Components Tab**: Edit component-specific settings
   - Button Settings (border radius, text transform)
   - Paper & Card Settings (elevation)
   - Other Components (app bar, drawer, dialog, chip, list, tooltip)
   - Typography Settings (H1, H2, H3, Body font sizes)

6. **Advanced JSON Tab**: Edit MUI component overrides
   - Monaco editor for advanced MUI component customizations
   - Supports all MUI component override syntax
   - Changes are immediately reflected in the live preview

### Live Preview

The theme editor includes a live preview panel that shows:
- Theme title and description preview
- Primary and secondary buttons
- Text field
- All status alerts (success, error, warning, info)

**All changes made in any tab are immediately reflected in the live preview.**

### Saving a Theme

1. Make your desired changes in any of the tabs
2. Click the "Save" button in the top toolbar
3. The theme will be:
   - Downloaded as a JSON file to your computer
   - Added to the available themes list
   - Ready to be applied

### Loading an Existing Theme

#### From the Themes Tab:
1. Click "Load Custom Theme"
2. Select a theme JSON file from your computer
3. The theme is added to the available themes list

#### In the Theme Editor:
1. Click "Load and Edit Theme"
2. Select a theme JSON file
3. The theme is loaded into the editor for modification
4. All fields are populated from the JSON file

### Applying a Theme

1. Navigate to the Preferences → Themes tab
2. In the "Select Theme" section, choose your desired theme
3. The theme is immediately applied across the entire application
4. The selection is saved to localStorage

### Deleting a Custom Theme

1. In the theme selection list, find your custom theme
2. Click the red delete icon (🗑️) next to the theme name
3. Confirm the deletion
4. The theme is removed from the list

## Technical Details

### Theme Storage
- Custom themes are stored in localStorage under the key `customThemes`
- Selected theme ID is stored in localStorage under the key `selectedThemeId`
- Themes persist across browser sessions

### Theme Application
- The container app loads the selected theme on startup
- Theme changes are communicated via custom events (`themeChanged`)
- Both new format and legacy format themes are supported

### MUI Component Overrides
The `muiComponentOverrides` section allows you to customize any MUI component using the standard MUI theming API. For example:

```json
{
  "MuiButton": {
    "styleOverrides": {
      "root": {
        "textTransform": "none",
        "fontWeight": 600
      }
    },
    "defaultProps": {
      "disableRipple": false
    }
  }
}
```

Refer to the [MUI Theming documentation](https://mui.com/material-ui/customization/theming/) for more details.

## Best Practices

1. **Version Control**: Use semantic versioning for your themes (e.g., 1.0.0, 1.1.0, 2.0.0)
2. **Descriptions**: Add meaningful descriptions to help identify themes
3. **Color Contrast**: Ensure sufficient contrast between text and background colors for accessibility
4. **Testing**: Use the live preview to test your theme before saving
5. **Backup**: Export and save important themes as JSON files
6. **MUI Overrides**: Test advanced MUI overrides thoroughly to ensure they don't break component functionality

## Troubleshooting

### Theme Not Applying
- Check browser localStorage to ensure the theme is saved
- Verify the JSON format is correct
- Check browser console for any error messages

### Live Preview Not Updating
- Ensure there are no JSON syntax errors in the Advanced JSON tab
- Try switching to a different tab and back

### JSON Errors in Monaco Editor
- The editor will show an error message if the JSON is invalid
- Fix the syntax error before saving
- Use the "Toggle Theme" button in the editor settings for better visibility

import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '60px',
            height: '40px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        />
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="small"
          placeholder="#000000"
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
};

export default ColorPicker;

import React, { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

interface MFELoaderProps {
  mfeName: string;
  mfeUrl?: string;
}

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
    <CircularProgress />
  </Box>
);

// Dynamic MFE loader using import maps
const MFELoader: React.FC<MFELoaderProps> = ({ mfeName }) => {
  // In production, this would load from import maps
  // For development, we'll use lazy loading from local packages
  const getMFEComponent = () => {
    switch (mfeName) {
      case 'home':
        // In production: return lazy(() => import('home-mfe'));
        // For now, return a placeholder
        return lazy(() =>
          import('./MFEPlaceholder').then(module => ({
            default: () => module.default({ name: 'Home' }),
          }))
        );
      case 'preferences':
        return lazy(() =>
          import('./MFEPlaceholder').then(module => ({
            default: () => module.default({ name: 'Preferences' }),
          }))
        );
      case 'account':
        return lazy(() =>
          import('./MFEPlaceholder').then(module => ({
            default: () => module.default({ name: 'Account' }),
          }))
        );
      case 'admin':
        return lazy(() =>
          import('./MFEPlaceholder').then(module => ({
            default: () => module.default({ name: 'Admin' }),
          }))
        );
      default:
        return lazy(() =>
          import('./MFEPlaceholder').then(module => ({
            default: () => module.default({ name: 'Not Found' }),
          }))
        );
    }
  };

  const MFEComponent = getMFEComponent();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <MFEComponent />
    </Suspense>
  );
};

export default MFELoader;

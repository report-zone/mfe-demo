import React, { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { getMFEComponent } from '../config/mfeRegistry';
import ErrorBoundary from './ErrorBoundary';

interface MFELoaderProps {
  mfeName: string;
  mfeUrl?: string;
}

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
    <CircularProgress />
  </Box>
);

/**
 * MFE Loader Component
 * 
 * Following the Open/Closed Principle (OCP),
 * this component uses the MFE registry to load micro frontends.
 * New MFEs can be added to the registry without modifying this component.
 */
const MFELoader: React.FC<MFELoaderProps> = ({ mfeName }) => {
  // Get the component from the registry (extensible, no switch statement)
  const MFEComponent = getMFEComponent(mfeName);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <MFEComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default MFELoader;

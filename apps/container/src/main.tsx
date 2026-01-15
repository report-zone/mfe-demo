import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'your-pool-id',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'your-client-id',
      region: import.meta.env.VITE_AWS_REGION || 'your-region',
      authFlowType: 'USER_PASSWORD_AUTH',
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

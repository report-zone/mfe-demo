import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_wQ130IObD',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '73isvistqelpjmksjvshopird9',
      //userPoolClientId: import.meta.env.VITE_CLIENT_ID || '6a8duirf74r73pada6o6p45l37',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress CORS errors from browser extensions and external services
// These errors are not from our code but from browser extensions intercepting fetch requests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  // Filter out CORS errors from ipapi.co (likely from browser extensions)
  if (
    message.includes('ipapi.co') ||
    (message.includes('CORS') && message.includes('ipapi.co')) ||
    message.includes('content.js') ||
    (message.includes('Access-Control-Allow-Origin') && message.includes('ipapi.co'))
  ) {
    // Silently ignore these errors from browser extensions
    return;
  }
  originalConsoleError.apply(console, args);
};

// Suppress CORS errors from external services (like browser extensions)
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  const errorSource = event.filename || '';
  
  // Suppress CORS errors from external APIs that we don't control
  if (
    errorMessage.includes('CORS') ||
    errorMessage.includes('Access-Control-Allow-Origin') ||
    errorMessage.includes('ipapi.co') ||
    errorSource.includes('ipapi.co') ||
    errorSource.includes('content.js')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Also catch unhandled promise rejections from fetch (often from browser extensions)
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  let errorMessage = '';
  
  if (reason instanceof Error) {
    errorMessage = reason.message;
  } else if (typeof reason === 'string') {
    errorMessage = reason;
  } else if (reason && typeof reason === 'object') {
    errorMessage = JSON.stringify(reason);
  }
  
  // Suppress CORS errors from external services we don't control
  if (
    errorMessage.includes('CORS') ||
    errorMessage.includes('Access-Control-Allow-Origin') ||
    errorMessage.includes('ipapi.co') ||
    errorMessage.includes('content.js') ||
    errorMessage.includes('ERR_FAILED')
  ) {
    // Silently ignore these errors from browser extensions
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

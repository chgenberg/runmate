import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
        <Toaster
          position="top-center"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              maxWidth: '400px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
              style: {
                background: '#22c55e',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              },
              style: {
                background: '#f43f5e',
                color: '#fff',
              },
            },
          }}
          // Prevent duplicate toasts
          containerClassName="toast-container"
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
); // Force rebuild Sun Jun 22 17:19:30 CEST 2025

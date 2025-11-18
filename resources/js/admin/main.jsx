import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import '../../css/app.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

ReactDOM.createRoot(document.getElementById('admin-root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter basename="/admin">
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);

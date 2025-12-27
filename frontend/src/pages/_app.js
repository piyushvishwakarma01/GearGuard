import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

function MyApp({ Component, pageProps }) {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <>
            <Component {...pageProps} />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

export default MyApp;

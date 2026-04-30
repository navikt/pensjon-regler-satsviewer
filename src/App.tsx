import AppPage from './components/AppPage'
import HistoryPage from './components/HistoryPage'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isProduction } from './utils/environment'
import './App.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    const isProd = isProduction();

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<AppPage/>} />
                    <Route path="/historikk" element={isProd ? <Navigate to="/" replace /> : <HistoryPage/>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App

import SatsPage from './components/SatsPage'
import HistoryPage from './components/HistoryPage'
import AppHeader from './components/AppHeader'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isProduction } from './utils/environment'
import { ThemeProvider } from './theme/ThemeContext'

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
                <ThemeProvider>
                    <div className="app-shell">
                        <AppHeader/>
                        <Routes>
                            <Route path="/" element={<SatsPage/>} />
                            <Route path="/historikk" element={isProd ? <Navigate to="/" replace /> : <HistoryPage/>} />
                        </Routes>
                    </div>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App

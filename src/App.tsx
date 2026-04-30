import AppPage from './components/AppPage'
import HistoryPage from './components/HistoryPage'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<AppPage/>} />
                    <Route path="/historikk" element={<HistoryPage/>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App

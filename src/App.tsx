import AppPage from './components/AppPage'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
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
            <AppPage/>
        </QueryClientProvider>
    )
}

export default App

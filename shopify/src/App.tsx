import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductTable from './components/ProductTable';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductTable />
    </QueryClientProvider>
  );
}

export default App;
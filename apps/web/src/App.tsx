import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import InvitePage from './pages/InvitePage';
import GroupHomePage from './pages/GroupHomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/g/:token" element={<InvitePage />} />
          <Route path="/group/:groupId" element={<GroupHomePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

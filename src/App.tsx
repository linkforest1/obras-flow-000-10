
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { FilterProvider } from './contexts/FilterContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';
import PublicReport from './pages/PublicReport';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import RDO from './pages/RDO';
import Team from './pages/Team';
import Timeline from './pages/Timeline';
import { Toaster } from "@/components/ui/toaster"
import ResetPassword from './pages/ResetPassword';
import Treinamentos from './pages/Treinamentos';
import QualidadeBrafer from './pages/QualidadeBrafer';
import VisaoGeral from './pages/VisaoGeral';
import { AIChatbot } from './components/AIChatbot';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <FilterProvider>
            <Router>
              <AIChatbot />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/public-report" element={<PublicReport />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/atividades"
                  element={
                    <ProtectedRoute>
                      <Activities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rdo"
                  element={
                    <ProtectedRoute>
                      <RDO />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/equipe"
                  element={
                    <ProtectedRoute>
                      <Team />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cronograma"
                  element={
                    <ProtectedRoute>
                      <Timeline />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/treinamentos"
                  element={
                    <ProtectedRoute>
                      <Treinamentos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/qualidade-brafer"
                  element={
                    <ProtectedRoute>
                      <QualidadeBrafer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/visao-geral"
                  element={
                    <ProtectedRoute>
                      <VisaoGeral />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorio/:obraId"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
            <Toaster />
          </FilterProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

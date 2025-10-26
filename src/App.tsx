import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import QuickSales from "./pages/QuickSales";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Menu from "./pages/Menu";
import Inventory from "./pages/Inventory";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen overflow-x-hidden">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/quick" element={<ProtectedRoute><MainLayout><ErrorBoundary><QuickSales /></ErrorBoundary></MainLayout></ProtectedRoute>} />
                <Route path="/purchases/new" element={<ProtectedRoute><MainLayout><ErrorBoundary><Purchases /></ErrorBoundary></MainLayout></ProtectedRoute>} />
                <Route path="/expenses/new" element={<ProtectedRoute><MainLayout><ErrorBoundary><Expenses /></ErrorBoundary></MainLayout></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute><MainLayout><ErrorBoundary><Menu /></ErrorBoundary></MainLayout></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><MainLayout><ErrorBoundary><Inventory /></ErrorBoundary></MainLayout></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Transactions /></MainLayout></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            <footer className="mt-auto py-6 border-t mobile-footer-padding">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <div className="border-t border-border/50 pt-6">
                  <p>
                    Built by Dawit Getachew — © 2025 Automation & Business Intelligence Systems ·{' '}
                    <a 
                      href="https://github.com/David-Getachew/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub
                    </a>
                    {' · '}
                    <a 
                      href="https://www.linkedin.com/in/dawit-getachew-mekonen" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn
                    </a>
                    {' · '}
                    <a 
                      href="https://www.davidgetachew.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Website
                    </a>
                  </p>
                </div>
              </div>
            </footer>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
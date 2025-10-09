import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/sales/quick" element={<MainLayout><QuickSales /></MainLayout>} />
              <Route path="/purchases/new" element={<MainLayout><Purchases /></MainLayout>} />
              <Route path="/expenses/new" element={<MainLayout><Expenses /></MainLayout>} />
              <Route path="/menu" element={<MainLayout><Menu /></MainLayout>} />
              <Route path="/inventory" element={<MainLayout><Inventory /></MainLayout>} />
              <Route path="/transactions" element={<MainLayout><Transactions /></MainLayout>} />
              <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
              <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <footer className="mt-auto py-6 border-t">
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
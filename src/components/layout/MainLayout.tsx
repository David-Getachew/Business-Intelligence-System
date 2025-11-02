import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseConfigBanner } from '../SupabaseConfigBanner';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Hamburger menu button - Fixed positioning for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full transition-all duration-500 ease-in-out"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>      
      {/* Main content area - shifts right when sidebar expands */}
      <div className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto pt-6 md:pt-4">
          <div className="max-w-full">
            {!isSupabaseConfigured && <SupabaseConfigBanner />}
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
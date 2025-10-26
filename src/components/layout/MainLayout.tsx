import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseConfigBanner } from '../SupabaseConfigBanner';

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
      
      {/* Main content area - shifts right when sidebar expands */}
      <div className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
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
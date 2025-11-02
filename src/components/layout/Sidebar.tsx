import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  UtensilsCrossed,
  Boxes,
  FileText,
  Settings,
  X,
  CreditCard,
  Moon,
  Sun,
  LogOut,
  Menu,
  Zap,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Quick Sales', href: '/sales/quick', icon: ShoppingCart },
  { name: 'POS Sale', href: '/sales/pos', icon: Zap },
  { name: 'Stock Count', href: '/stock/count', icon: BarChart3 },
  { name: 'Purchases', href: '/purchases/new', icon: Package },
  { name: 'Expenses', href: '/expenses/new', icon: Receipt },
  { name: 'Menu & Recipes', href: '/menu', icon: UtensilsCrossed },
  { name: 'Inventory', href: '/inventory', icon: Boxes },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}


      {/* Fixed positioned sidebar with proper flex layout */}
      <aside
        className={cn(
          'group fixed top-0 left-0 z-50 h-screen bg-card border-r transition-all duration-300 ease-in-out',
          'will-change-transform overflow-hidden flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:w-16 hover:md:w-64',
          isExpanded && 'md:w-64'
        )}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsExpanded(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsExpanded(false);
        }}
      >
        {/* Top: Website title/logo - Fixed height container */}
        <div className="flex items-center h-16 border-b px-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 w-full">
            {/* Fixed width icon container - always left-aligned */}
            <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
              <img src="/sunsetcircle.png" alt="Sunset Sips n' Bites" className="h-10 w-10 object-contain" />
            </div>
            {/* Text that expands on hover - positioned after icon */}
            <h1 className={cn(
              "font-heading font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap",
              "md:opacity-0 md:w-0 md:overflow-hidden",
              isHovered && "md:opacity-100 md:w-auto"
            )}>
              Sunset sips n' bites
            </h1>
          </div>
        </div>

        {/* Middle: Navigation links - Scrollable container with proper spacing */}
        <nav className="flex flex-col flex-1 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg px-1 py-2 mx-2 text-sm font-medium transition-all',
                  'justify-start', // Always left-align, never center
                  isActive
                    ? 'gradient-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              {/* Fixed width icon container - prevents jiggle and ensures alignment */}
              <div className="w-10 h-5 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5" />
              </div>
              {/* Text that expands on hover - positioned after icon */}
              <span className={cn(
                'transition-all duration-300 whitespace-nowrap',
                'md:opacity-0 md:w-0 md:overflow-hidden',
                isHovered && "md:opacity-100 md:w-auto"
              )}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Theme toggle and logout - Fixed at bottom with proper spacing */}
        <div className="flex flex-col items-start space-y-2 p-0.8 pb-4 border-t mt-auto flex-shrink-0">
          {/* Theme toggle - Always visible, left-aligned with consistent icon container */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              'flex items-center text-sm font-medium transition-all w-full',
              'justify-start', // Always left-align
              'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {/* Fixed width icon container - prevents jiggle and ensures alignment */}
            <div className="w-10 h-5 flex items-center justify-center flex-shrink-0">
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-7" />
              )}
            </div>
            {/* Text that expands on hover */}
            <span className={cn(
              'transition-all duration-300 whitespace-nowrap',
              'md:opacity-0 md:w-0 md:overflow-hidden',
              isHovered && "md:opacity-100 md:w-auto"
            )}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </Button>
          
          {/* Logout button - Always visible with expanding text, left-aligned */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
              'flex items-center text-sm font-medium transition-all w-full',
              'justify-start', // Always left-align
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            )}
          >
            {/* Fixed width icon container - prevents jiggle and ensures alignment */}
            <div className="w-10 h-5 flex items-center justify-center flex-shrink-0">
              <LogOut className="h-5 w-5" />
            </div>
            {/* Text that expands on hover */}
            <span className={cn(
              'transition-all duration-300 whitespace-nowrap',
              'md:opacity-0 md:w-0 md:overflow-hidden',
              isHovered && "md:opacity-100 md:w-auto"
            )}>
              Logout
            </span>
          </Button>
        </div>
      </aside>
    </>
  );
}
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Key,
  FileText,
  CheckSquare,
  Vault,
  Wallet,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/passwords', icon: Key, label: 'Passwords' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/todos', icon: CheckSquare, label: 'Todo Lists' },
  { to: '/vault', icon: Vault, label: 'Digital Vault' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
];

export function Sidebar() {
  const { logout, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card shadow-premium-md lg:hidden border border-border"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
          // Mobile: slide in/out
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, can collapse
          'lg:translate-x-0',
          desktopCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-72'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className={cn('flex items-center gap-3', desktopCollapsed && 'lg:justify-center lg:w-full')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shrink-0">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={cn(
              'h-4 w-4 text-sidebar-foreground transition-transform duration-200',
              desktopCollapsed && 'rotate-180'
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  desktopCollapsed && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={cn(desktopCollapsed && 'lg:hidden')}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                desktopCollapsed && 'lg:justify-center lg:px-0',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className={cn(desktopCollapsed && 'lg:hidden')}>Settings</span>
          </NavLink>

          {profile && (
            <div className={cn("px-3 py-2", desktopCollapsed && "lg:hidden")}>
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className={cn(
              'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              desktopCollapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={cn(desktopCollapsed && 'lg:hidden')}>Sign out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}

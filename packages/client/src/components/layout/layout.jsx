import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import Sidebar from './sidebar';
import Header from './header';
import CommandMenu from './command-menu';
import { ALL_TOOLS } from '@/config/tools';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Get current page title
  const currentTool = ALL_TOOLS.find((tool) => tool.path === location.pathname);
  const title = currentTool?.label || 'Home';

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title={title} />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>

        <CommandMenu />
        <Toaster position="bottom-right" richColors />
      </div>
    </TooltipProvider>
  );
};

export default Layout;

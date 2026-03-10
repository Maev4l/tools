import { NavLink, useLocation } from 'react-router-dom';
import { FileText, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TOOL_CATEGORIES, CATEGORY_COLORS } from '@/config/tools';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col border-r transition-all duration-300',
        // Glassmorphism effect
        'bg-sidebar/80 backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-gradient-to-br from-primary to-emerald-600 p-1.5 transition-transform group-hover:scale-110">
            <FileText className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Tools
            </span>
          )}
        </NavLink>
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto transition-transform hover:scale-110', collapsed && 'mx-auto')}
          onClick={onToggle}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-4 px-2">
          {TOOL_CATEGORIES.map((category) => {
            const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.emerald;

            return (
              <div key={category.id}>
                {!collapsed && (
                  <h3 className={cn('mb-2 px-2 text-xs font-semibold uppercase tracking-wider', colors.text)}>
                    {category.label}
                  </h3>
                )}
                {collapsed && <Separator className="mb-2" />}
                <ul className="space-y-1">
                  {category.tools.map((tool) => {
                    const isActive = location.pathname === tool.path;
                    const Icon = tool.icon;

                    const linkContent = (
                      <NavLink
                        to={tool.path}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                          isActive
                            ? cn(colors.bg, colors.text, 'font-medium shadow-sm')
                            : cn('text-sidebar-foreground', colors.bgHover, 'hover:translate-x-0.5'),
                          collapsed && 'justify-center px-2'
                        )}
                      >
                        <div className={cn('transition-transform', isActive && 'scale-110')}>
                          <Icon className={cn('h-4 w-4', isActive && colors.text)} />
                        </div>
                        {!collapsed && <span>{tool.label}</span>}
                      </NavLink>
                    );

                    if (collapsed) {
                      return (
                        <li key={tool.id}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right">{tool.label}</TooltipContent>
                          </Tooltip>
                        </li>
                      );
                    }

                    return <li key={tool.id}>{linkContent}</li>;
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            All processing happens locally
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

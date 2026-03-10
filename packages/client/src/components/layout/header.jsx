import { useEffect, useState } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ title }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="relative flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-6">
      {/* Gradient accent line at top */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Search hint */}
        <Button
          variant="outline"
          className="hidden md:flex items-center gap-2 text-muted-foreground transition-all hover:scale-[1.02] hover:shadow-md"
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Cmd</span>K
          </kbd>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="transition-all hover:scale-110 hover:rotate-12"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;

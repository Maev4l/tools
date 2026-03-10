import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ALL_TOOLS } from '@/config/tools';

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tools..." />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>
        <CommandGroup heading="Tools">
          {ALL_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <CommandItem key={tool.id} onSelect={() => handleSelect(tool.path)}>
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{tool.label}</span>
                  <span className="text-xs text-muted-foreground">{tool.description}</span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;

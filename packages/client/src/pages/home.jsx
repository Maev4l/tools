import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOOL_CATEGORIES, CATEGORY_COLORS } from '@/config/tools';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Online Tools
        </h1>
        <p className="text-lg text-muted-foreground">
          Fast, secure, and private. Everything runs locally in your browser.
        </p>
      </div>

      {/* Tool grid */}
      <div className="space-y-8">
        {TOOL_CATEGORIES.map((category) => {
          const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.emerald;

          return (
            <div key={category.id}>
              <h2 className={cn('text-xl font-semibold mb-4', colors.text)}>{category.label}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {category.tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => navigate(tool.path)}
                      className={cn(
                        'group relative flex items-start gap-4 rounded-xl border bg-card p-5 text-left',
                        'transition-all duration-300 ease-out',
                        'hover:shadow-xl hover:-translate-y-1 hover:border-transparent',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        'overflow-hidden'
                      )}
                    >
                      {/* Gradient background on hover */}
                      <div
                        className={cn(
                          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                          'bg-gradient-to-br',
                          colors.gradient,
                          'opacity-0 group-hover:opacity-[0.03]'
                        )}
                      />

                      {/* Icon */}
                      <div
                        className={cn(
                          'rounded-xl p-3 transition-all duration-300',
                          'group-hover:scale-110 group-hover:shadow-lg',
                          colors.bg,
                          colors.text
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1 relative">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">
                          {tool.label}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="relative self-center">
                        <ArrowRight
                          className={cn(
                            'h-5 w-5 transition-all duration-300',
                            'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0',
                            colors.text
                          )}
                        />
                      </div>

                      {/* Bottom border gradient on hover */}
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 h-[2px]',
                          'bg-gradient-to-r',
                          colors.gradient,
                          'transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features */}
      <div className="grid gap-4 sm:grid-cols-3 pt-8 border-t">
        {[
          { emoji: '🔒', title: 'Private', desc: 'Data never leaves your device' },
          { emoji: '⚡', title: 'Fast', desc: 'Instant results, no server' },
          { emoji: '🆓', title: 'Free', desc: 'No sign-up, no limits' },
        ].map((feature) => (
          <div
            key={feature.title}
            className="text-center space-y-2 p-4 rounded-xl transition-all duration-300 hover:bg-muted/50 hover:scale-105"
          >
            <div className="text-3xl">{feature.emoji}</div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

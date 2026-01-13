import { Link, useLocation } from "wouter";
import { Code2, FileCode2, History, TerminalSquare, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSnippets } from "@/hooks/use-compiler";
import { formatDistanceToNow } from "date-fns";

export function Sidebar() {
  const [location] = useLocation();
  const { data: snippets, isLoading } = useSnippets();

  const navItems = [
    { label: "Compiler", icon: Code2, href: "/" },
    { label: "Decompiler", icon: FileCode2, href: "/decompile" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border bg-card/50 backdrop-blur-sm fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <TerminalSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">J-Compiler</h1>
            <p className="text-xs text-muted-foreground">v1.0.0-beta</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tools</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
                location === item.href
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 mr-3 transition-colors", location === item.href ? "text-primary" : "group-hover:text-foreground")} />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      {/* History */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 border-t border-border">
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Snippets</p>
          <History className="w-3 h-3 text-muted-foreground" />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) : snippets?.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">
              No snippets yet
            </div>
          ) : (
            snippets?.map((snippet) => (
              <div 
                key={snippet.id} 
                className="group p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all cursor-pointer"
                onClick={() => {
                   // In a real app, this would load the snippet into the editor via URL param or context
                   // For now, we just show the metadata
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate max-w-[120px] text-foreground group-hover:text-primary transition-colors">
                    {snippet.title}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  {formatDistanceToNow(new Date(snippet.createdAt!), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-border bg-card/30">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="w-4 h-4" />
          <span>Open Source</span>
        </a>
      </div>
    </aside>
  );
}

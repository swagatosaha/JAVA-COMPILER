import { Terminal, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalOutputProps {
  output?: string;
  error?: string;
  isLoading?: boolean;
  className?: string;
}

export function TerminalOutput({ output, error, isLoading, className }: TerminalOutputProps) {
  return (
    <div className={cn("flex flex-col h-full bg-black rounded-xl border border-border overflow-hidden font-mono", className)}>
      {/* Terminal Header */}
      <div className="flex items-center px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center text-xs text-muted-foreground select-none">
          <Terminal className="w-3 h-3 mr-2" />
          <span>console output</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-auto custom-scrollbar text-sm md:text-base">
        {isLoading ? (
          <div className="flex items-center text-muted-foreground animate-pulse">
            <span className="mr-2">&gt;</span> Compiling and executing...
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="flex items-center text-red-400 font-bold border-b border-red-500/20 pb-2 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              Compilation/Runtime Error
            </div>
            <pre className="whitespace-pre-wrap text-red-300 font-mono text-xs md:text-sm">
              {error}
            </pre>
          </div>
        ) : output ? (
          <div className="space-y-2">
            <div className="flex items-center text-green-400 font-bold border-b border-green-500/20 pb-2 mb-2">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Execution Successful
            </div>
            <pre className="whitespace-pre-wrap text-emerald-100 font-mono text-xs md:text-sm">
              {output}
            </pre>
          </div>
        ) : (
          <div className="text-muted-foreground/50 italic">
            &gt; Ready to execute code...
            <br />
            &gt; Click "Run" to compile and run main class.
          </div>
        )}
      </div>
    </div>
  );
}

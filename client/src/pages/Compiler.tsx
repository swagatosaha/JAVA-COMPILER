import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CodeEditor } from "@/components/CodeEditor";
import { TerminalOutput } from "@/components/TerminalOutput";
import { useCompile, useCreateSnippet } from "@/hooks/use-compiler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Save, Loader2, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
        
        // Try some math
        int a = 5;
        int b = 10;
        System.out.println("Sum: " + (a + b));
    }
}`;

export default function Compiler() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<{ stdout: string; error?: string } | null>(null);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const compileMutation = useCompile();
  const saveSnippetMutation = useCreateSnippet();

  const handleRun = () => {
    setOutput(null);
    compileMutation.mutate(code, {
      onSuccess: (data) => {
        setOutput({ stdout: data.output, error: data.error });
        if (data.error) {
          toast({
            variant: "destructive",
            title: "Compilation Failed",
            description: "Check the terminal output for details.",
          });
        } else {
          toast({
            title: "Execution Successful",
            description: "Code ran successfully.",
          });
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const handleSave = () => {
    if (!snippetTitle.trim()) return;

    saveSnippetMutation.mutate({
      title: snippetTitle,
      code,
      output: output?.stdout || "",
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSnippetTitle("");
        toast({
          title: "Snippet Saved",
          description: "Your code has been saved to history.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save your snippet.",
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 lg:p-8 overflow-hidden h-screen flex flex-col">
        {/* Header Actions */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Java Compiler</h2>
            <p className="text-muted-foreground">Write, compile, and execute Java code in the browser.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-border hover:bg-muted">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Snippet</DialogTitle>
                  <DialogDescription>
                    Give your code snippet a memorable name to find it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    id="name"
                    placeholder="e.g., Matrix Multiplication"
                    value={snippetTitle}
                    onChange={(e) => setSnippetTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSave} 
                    disabled={!snippetTitle.trim() || saveSnippetMutation.isPending}
                  >
                    {saveSnippetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Snippet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleRun} 
              disabled={compileMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 min-w-[120px]"
            >
              {compileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Main Workspace - Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Editor Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full min-h-[400px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Main.java
              </span>
              <span className="text-xs text-muted-foreground/50 font-mono">UTF-8</span>
            </div>
            <CodeEditor 
              value={code} 
              onChange={(val) => setCode(val || "")}
              language="java"
            />
          </motion.div>

          {/* Terminal Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full min-h-[300px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Terminal
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground" onClick={() => setOutput(null)}>
                Clear
              </Button>
            </div>
            <TerminalOutput 
              output={output?.stdout} 
              error={output?.error}
              isLoading={compileMutation.isPending}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

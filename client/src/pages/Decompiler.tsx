import { useCallback, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CodeEditor } from "@/components/CodeEditor";
import { useDecompile } from "@/hooks/use-compiler";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Decompiler() {
  const [decompiledCode, setDecompiledCode] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const decompileMutation = useDecompile();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setDecompiledCode(""); // Reset previous output
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/java-vm': ['.class']
    },
    maxFiles: 1
  });

  const handleDecompile = () => {
    if (!file) return;

    decompileMutation.mutate(file, {
      onSuccess: (data) => {
        setDecompiledCode(data.source);
        toast({
          title: "Decompilation Complete",
          description: "Source code recovered successfully.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Decompilation Failed",
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col h-screen">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold tracking-tight">Class Decompiler</h2>
          <p className="text-muted-foreground">Upload compiled .class files to recover the original source code.</p>
        </motion.div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          
          {/* Upload Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 flex flex-col gap-6"
          >
            <div 
              {...getRootProps()} 
              className={cn(
                "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer bg-card/50",
                isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-card",
                file ? "border-green-500/50 bg-green-500/5" : ""
              )}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                      <FileCode className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-lg mb-1 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove File
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="drop-prompt"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-lg mb-1">Drop .class file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-medium flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Limitations
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Only supports standard Java bytecode</li>
                <li>Obfuscated code may yield partial results</li>
                <li>Max file size: 5MB</li>
              </ul>
            </div>

            <Button 
              size="lg" 
              className={cn(
                "w-full font-semibold shadow-lg transition-all",
                file ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              onClick={handleDecompile}
              disabled={!file || decompileMutation.isPending}
            >
              {decompileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Decompiling...
                </>
              ) : (
                <>
                  <FileCode className="w-5 h-5 mr-2" />
                  Decompile File
                </>
              )}
            </Button>
          </motion.div>

          {/* Result Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-border bg-card">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", decompiledCode ? "bg-green-500" : "bg-muted-foreground")} />
                Decompiled Output
              </span>
              {decompiledCode && (
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Success
                </span>
              )}
            </div>
            
            <div className="flex-1 relative">
              {decompiledCode ? (
                <CodeEditor 
                  value={decompiledCode} 
                  language="java" 
                  readOnly={true} 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 p-8 text-center">
                  <FileCode className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No code to display</p>
                  <p className="text-sm">Upload a class file and click decompile to view source.</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

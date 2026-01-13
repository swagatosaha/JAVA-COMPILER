import Editor, { type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = "java", 
  readOnly = false 
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Define a custom theme that matches our app
    monaco.editor.defineTheme("terminal-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "identifier", foreground: "8be9fd" },
        { token: "string", foreground: "f1fa8c" },
        { token: "type", foreground: "50fa7b" },
      ],
      colors: {
        "editor.background": "#1e293b", // Matches tailwind slate-800
        "editor.lineHighlightBackground": "#2d3b4f",
        "editorCursor.foreground": "#38bdf8",
      },
    });
    
    monaco.editor.setTheme("terminal-dark");
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl border border-border shadow-inner bg-card">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="vs-dark" // Fallback until custom theme loads
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, monospace",
          fontLigatures: true,
          padding: { top: 20 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          contextmenu: true,
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
            verticalScrollbarSize: 10,
          },
        }}
        loading={
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground bg-card">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="font-mono text-sm">Initializing JVM Environment...</span>
          </div>
        }
      />
    </div>
  );
}

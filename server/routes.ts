
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import os from "os";

// Configure multer for file uploads
const upload = multer({ dest: os.tmpdir() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Compiler Route
  app.post(api.compiler.compile.path, async (req, res) => {
    try {
      const { code } = api.compiler.compile.input.parse(req.body);

      // Create a unique temp directory for this compilation
      const runId = uuidv4();
      const tmpDir = path.join(os.tmpdir(), "java-compiler", runId);
      
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const filePath = path.join(tmpDir, "Main.java");
      
      // Write the code to Main.java
      // Assumption: The user's class is named Main or we force it. 
      // Ideally we parse the class name, but for MVP we assume public class Main.
      fs.writeFileSync(filePath, code);

      // Compile
      exec(`javac Main.java`, { cwd: tmpDir }, (error, stdout, stderr) => {
        if (error) {
          // Compilation error
          res.json({ success: false, output: stderr || error.message });
          // Cleanup
          fs.rmSync(tmpDir, { recursive: true, force: true });
          return;
        }

        // Run (with timeout to prevent infinite loops)
        exec(`java Main`, { cwd: tmpDir, timeout: 5000 }, (runError, runStdout, runStderr) => {
          const output = runStdout + (runStderr ? `\nError:\n${runStderr}` : "");
          
          res.json({ 
            success: !runError, 
            output: output || (runError ? runError.message : "No output"),
            error: runError ? runError.message : undefined
          });

          // Cleanup
          fs.rmSync(tmpDir, { recursive: true, force: true });
        });
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Decompiler Route
  app.post(api.decompiler.upload.path, upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const tmpDir = path.join(os.tmpdir(), "java-decompiler", uuidv4());
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const targetPath = path.join(tmpDir, req.file.originalname);

    try {
      // Move uploaded file to temp dir with original name (important for javap)
      fs.renameSync(req.file.path, targetPath);

      // Run javap (Disassembler)
      // -c: Disassemble code
      // -p: Show all classes and members
      exec(`javap -c -p "${targetPath}"`, (error, stdout, stderr) => {
        if (error) {
          res.json({ success: false, error: stderr || error.message, source: "" });
        } else {
          res.json({ success: true, source: stdout });
        }
        
        // Cleanup
        fs.rmSync(tmpDir, { recursive: true, force: true });
      });

    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message, source: "" });
      // Cleanup if possible
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Snippets Routes
  app.get(api.snippets.list.path, async (req, res) => {
    const list = await storage.getSnippets();
    res.json(list);
  });

  app.post(api.snippets.create.path, async (req, res) => {
    const input = api.snippets.create.input.parse(req.body);
    const snippet = await storage.createSnippet(input);
    res.status(201).json(snippet);
  });

  return httpServer;
}

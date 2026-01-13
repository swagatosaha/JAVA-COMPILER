import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSnippet } from "@shared/routes";

// ============================================
// COMPILER HOOKS
// ============================================

export function useCompile() {
  return useMutation({
    mutationFn: async (code: string) => {
      // Validate with shared schema if needed, but here we just send the string
      const payload = { code };
      const res = await fetch(api.compiler.compile.path, {
        method: api.compiler.compile.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to compile code");
      }

      const data = await res.json();
      return api.compiler.compile.responses[200].parse(data);
    },
  });
}

// ============================================
// DECOMPILER HOOKS
// ============================================

export function useDecompile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.decompiler.upload.path, {
        method: api.decompiler.upload.method,
        body: formData, // No Content-Type header; fetch adds it with boundary automatically
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to decompile file");
      }

      const data = await res.json();
      return api.decompiler.upload.responses[200].parse(data);
    },
  });
}

// ============================================
// SNIPPET HOOKS
// ============================================

export function useSnippets() {
  return useQuery({
    queryKey: [api.snippets.list.path],
    queryFn: async () => {
      const res = await fetch(api.snippets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch snippets");
      return api.snippets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSnippet) => {
      // Zod validation before sending
      const validated = api.snippets.create.input.parse(data);
      
      const res = await fetch(api.snippets.create.path, {
        method: api.snippets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to save snippet");
      return api.snippets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.snippets.list.path] });
    },
  });
}


import { z } from 'zod';
import { insertSnippetSchema, snippets } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  compiler: {
    compile: {
      method: 'POST' as const,
      path: '/api/compiler/compile',
      input: z.object({
        code: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          output: z.string(),
          error: z.string().optional(),
        }),
      },
    },
  },
  decompiler: {
    upload: {
      method: 'POST' as const,
      path: '/api/decompiler/upload',
      // Multipart form data - input schema validation handled manually for file
      responses: {
        200: z.object({
          success: z.boolean(),
          source: z.string(),
          error: z.string().optional(),
        }),
      },
    },
  },
  snippets: {
    list: {
      method: 'GET' as const,
      path: '/api/snippets',
      responses: {
        200: z.array(z.custom<typeof snippets.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/snippets',
      input: insertSnippetSchema,
      responses: {
        201: z.custom<typeof snippets.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

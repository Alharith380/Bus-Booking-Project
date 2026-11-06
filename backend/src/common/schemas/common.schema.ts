import { z } from 'zod';

// مخططات مشتركة تُعاد في كل الموديولات بدل تكرارها

// :id في المسار
export const idParamSchema = z.object({
  id: z.string().min(1),
});

// ?page=&limit= — الترقيم اختياري ولا يغيّر شكل الاستجابة (مصفوفة)
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

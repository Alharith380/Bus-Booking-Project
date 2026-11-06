import type { PaginationQueryInput } from '../schemas/common.schema';

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const DEFAULTS = { page: 1, limit: 20, maxLimit: 100 };

// يُستخدم في كل قوائم الموديولات — يمنع تكرار قراءة page/limit
export function parsePagination(query: PaginationQueryInput = {}): Pagination {
  const page = Math.max(1, query.page ?? DEFAULTS.page);
  const limit = Math.min(DEFAULTS.maxLimit, Math.max(1, query.limit ?? DEFAULTS.limit));

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

// يُرسل لاحقاً في هيدر X-Total-Count بدل تغليف المصفوفة
export function buildPaginationMeta(pagination: Pagination, total: number): PaginationMeta {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  };
}

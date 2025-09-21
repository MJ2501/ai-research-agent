"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { listResearch } from "@/lib/api/research";
import { DEFAULT_PAGE_SIZE } from "@/lib/utils/constants";

export function useResearchList(opts?: {
  search?: string;
  pageSize?: number;
  paginated?: boolean;
  limit?: number;
}) {
  const pageSize = opts?.pageSize ?? DEFAULT_PAGE_SIZE;
  if (opts?.paginated) {
    return useInfiniteQuery({
      queryKey: ["research", "list", opts?.search, pageSize],
      queryFn: async ({ pageParam }) =>
        listResearch({
          search: opts?.search,
          cursor: pageParam as string | undefined,
          pageSize,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
  }

  return useQuery({
    queryKey: ["research", "list", opts?.search, opts?.limit],
    queryFn: () =>
      listResearch({ search: opts?.search, limit: opts?.limit ?? 5 }),
    select: (data) => data,
  });
}

"use client";
import { useState } from "react";
import { useResearchList } from "../../../lib/hooks/useResearchList";
import { TaskTable } from "../../../components/research/TaskTable";
import { SearchBar } from "../../../components/common/SearchBar";
import { Button } from "../../../components/ui/button";
import Link from "next/link";

export default function ResearchListPage() {
  const [query, setQuery] = useState("");
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useResearchList({ search: query, pageSize: 10, paginated: true });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search topics..."
          onSubmit={() => refetch()}
        />
        <Button asChild>
          <Link href="/(dashboard)/new">New Research</Link>
        </Button>
      </div>
      <TaskTable tasks={items} isLoading={isLoading} isError={isError} />
      <div className="flex justify-center">
        {hasNextPage && (
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        )}
      </div>
    </div>
  );
}

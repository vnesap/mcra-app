import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Search, X } from "lucide-react";

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  onClear: () => void;
}

/** Global search/filter bar to locate rooms by date or keyword. */
export function SearchBar({
  keyword,
  onKeywordChange,
  date,
  onDateChange,
  onClear,
}: SearchBarProps) {
  const hasFilter = keyword.trim() !== "" || date !== "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search rooms by title or keyword…"
          className="pl-9"
          data-ocid="lobby.search_input"
          aria-label="Search classrooms by keyword"
        />
      </div>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="pl-9 sm:w-44"
          data-ocid="lobby.date_input"
          aria-label="Filter classrooms by date"
        />
      </div>
      {hasFilter ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          data-ocid="lobby.clear_search_button"
        >
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

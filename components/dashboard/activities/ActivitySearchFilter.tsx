import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { debounce } from "lodash"; // ✅ Install lodash for debouncing

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  handleRefresh: () => void;
}

export function ActivitySearchFilter({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  handleRefresh,
}: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshTime = useRef<number>(0);

  // ✅ Debounce the refresh function with a 5-second cooldown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedRefresh = useCallback(
    debounce(() => {
      handleRefresh();
      lastRefreshTime.current = Date.now(); // Update last refresh timestamp
      setIsRefreshing(false); // ✅ Re-enable button
    }, 5000), // ⏳ Set cooldown time (5 seconds)
    [handleRefresh]
  );

  const handleButtonClick = () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;

    if (!isRefreshing && timeSinceLastRefresh >= 5000) {
      setIsRefreshing(true); // ❌ Disable refresh button immediately
      debouncedRefresh(); // ⏳ Start cooldown
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full sm:w-auto flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter & Refresh Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              {activeFilter ? `Filter: ${activeFilter}` : "Filter"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveFilter(null)}>All Types</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter("video")}>Video</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter("survey")}>Survey</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter("verification")}>Verification</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button with Cooldown */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          disabled={isRefreshing} // ✅ Disable button while refreshing
          className="h-10 w-10"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-muted" : ""}`} />
        </Button>
      </div>

      {/* Active Filter Badge 
      {activeFilter && (
        <Badge variant="outline" className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1">
          {activeFilter}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => setActiveFilter(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}*/}
    </div>
  );
}

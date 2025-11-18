import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';

export default function DataTableControls({
    perPage,
    onPerPageChange,
    search,
    onSearchChange,
    searchPlaceholder = "Search..."
}) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side - Show Entries */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
                <Select
                    value={perPage.toString()}
                    onValueChange={(value) => onPerPageChange(parseInt(value))}
                >
                    <SelectTrigger className="w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">entries</span>
            </div>

            {/* Right side - Search */}
            <div className="w-full sm:w-72">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-8"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

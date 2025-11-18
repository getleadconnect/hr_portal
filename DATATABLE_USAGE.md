# DataTable Controls Usage Guide

The DataTable controls have been implemented with "Show Entries" dropdown on the left and search box on the right, matching standard DataTable UX.

## Components Created

1. **`resources/js/admin/components/ui/select.jsx`** - Shadcn UI Select component
2. **`resources/js/admin/components/DataTableControls.jsx`** - Reusable DataTable controls component

## Usage in ApplicationsList

```jsx
import { useState } from 'react';
import DataTableControls from '../../components/DataTableControls';

export default function ApplicationsList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    return (
        <Card>
            <CardHeader>
                <DataTableControls
                    perPage={perPage}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setPage(1); // Reset to first page
                    }}
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1); // Reset to first page
                    }}
                    searchPlaceholder="Search applications..."
                />
            </CardHeader>
            <CardContent>
                {/* Your table here */}
            </CardContent>
        </Card>
    );
}
```

## How to Use in Other Pages

### For Employees List

```jsx
<DataTableControls
    perPage={perPage}
    onPerPageChange={(value) => {
        setPerPage(value);
        setPage(1);
    }}
    search={search}
    onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
    }}
    searchPlaceholder="Search employees..."
/>
```

### For Users List

```jsx
<DataTableControls
    perPage={perPage}
    onPerPageChange={(value) => {
        setPerPage(value);
        setPage(1);
    }}
    search={search}
    onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
    }}
    searchPlaceholder="Search users..."
/>
```

### For Job Categories

```jsx
<DataTableControls
    perPage={perPage}
    onPerPageChange={(value) => {
        setPerPage(value);
        setPage(1);
    }}
    search={search}
    onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
    }}
    searchPlaceholder="Search categories..."
/>
```

## Features

### Left Side - Show Entries Dropdown
- Options: 10, 25, 50, 100 entries per page
- Default: 10 entries
- Automatically resets to page 1 when changed
- Compact design with minimal width

### Right Side - Search Box
- Full-width search input (280px on desktop, full width on mobile)
- Magnifying glass icon
- Debounced search (can add if needed)
- Automatically resets to page 1 when searching
- Custom placeholder text support

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     Card Header                              │
├─────────────────────────────────────────────────────────────┤
│  Show [10 ▼] entries              🔍 [Search box.........]  │
├─────────────────────────────────────────────────────────────┤
│                      Table Content                           │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Design

- **Desktop**: Controls side-by-side (Show Entries left, Search right)
- **Mobile**: Stacked vertically
- Search box: Full width on mobile, 280px on desktop
- All components properly aligned and spaced

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `perPage` | number | Yes | Current per-page value |
| `onPerPageChange` | function | Yes | Callback when per-page changes |
| `search` | string | Yes | Current search value |
| `onSearchChange` | function | Yes | Callback when search changes |
| `searchPlaceholder` | string | No | Placeholder text for search (default: "Search...") |

## Complete Example

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import DataTableControls from '../../components/DataTableControls';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

export default function MyDataTable() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Fetch data with React Query
    const { data, isLoading } = useQuery({
        queryKey: ['mydata', page, search, perPage],
        queryFn: async () => {
            const response = await api.get('/admin/my-endpoint', {
                params: { page, search, per_page: perPage }
            });
            return response.data.data;
        },
    });

    return (
        <Card>
            <CardHeader>
                <DataTableControls
                    perPage={perPage}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setPage(1);
                    }}
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Search records..."
                />
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <table>
                        {/* Your table rows */}
                    </table>
                )}
            </CardContent>
        </Card>
    );
}
```

## Notes

- Always reset `page` to 1 when `perPage` or `search` changes
- The component is fully responsive and works on all screen sizes
- Search icon is from `lucide-react` package
- Select dropdown is from Shadcn UI (Radix UI)
- Styling matches the rest of the admin panel theme

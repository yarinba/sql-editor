# SQL Editor Types Library

This library contains shared TypeScript type definitions for the SQL Editor application. These types are used by both the frontend and backend to ensure type safety and consistency across the entire application.

## What's included

- **Schema Types**: Type definitions for database schema information (tables, columns)
- **Query Types**: Type definitions for SQL query execution, results, and errors
- **API Types**: Common types for API requests and responses

## Usage

Import types directly from the library:

```typescript
import { Table, Column, QueryResults } from '@sql-editor/types';
```

## Benefits

- Single source of truth for type definitions
- Ensures consistency between frontend and backend
- Improves developer experience with better autocompletion
- Reduces bugs caused by mismatched data structures

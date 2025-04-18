# SQL Editor Application - Memory Bank

## Project Overview

This project involves building a SQL query editor web application with functionality similar to Metabase's query editor. The application will connect to a predefined database schema with read-only permissions.

## Core Requirements

### SQL Editor

- Interactive SQL editor with syntax highlighting and auto-completion
- Support for basic query execution
- Clear indication of execution success or errors
- Display error messages to help users identify SQL mistakes

### Schema Explorer

- Simple, interactive schema explorer displaying database structure
- Expandable/collapsible tree view showing tables and columns
- Display column types and other metadata

### Query Results

- Clean, interactive table for displaying query results
- Ability to resize table columns
- Functionality to export query results as CSV files

## Technical Notes

- Application connects to a single predefined schema
- Read-only access to database
- No connection management required as it will use the default connection

## Project Structure

The application is organized as a monorepo with the following structure:

```
/sql-editor
  /apps
    /be              # NestJS backend application
    /fe              # React frontend application
  /libs
    /types           # Shared TypeScript types library
```

## Shared Types Library

To ensure consistency between frontend and backend, we've implemented a shared types library with:

- Schema types (tables, columns)
- Query execution types (requests, responses, results)
- Common API response types

This approach provides several benefits:

- Single source of truth for type definitions
- Strong typing across the entire application
- Better developer experience with autocompletion
- Reduced bugs from mismatched data structures

## API Schema

### Schema Discovery

- `GET /api/schema/tables` - List all tables in the predefined schema

  - **Request**: No parameters required
  - **Response**: JSON array of table objects
    ```json
    [
      {
        "name": "users",
        "description": "User accounts table",
        "rowCount": 2500
      },
      {
        "name": "orders",
        "description": "Customer orders",
        "rowCount": 10430
      }
    ]
    ```

- `GET /api/schema/tables/{table}` - Get detailed information about a specific table

  - **Request**: Path parameter `table` (table name)
  - **Response**: JSON object with table details
    ```json
    {
      "name": "users",
      "description": "User accounts table",
      "rowCount": 2500,
      "columns": [
        {
          "name": "id",
          "type": "INTEGER",
          "nullable": false,
          "isPrimary": true,
          "description": "Primary key"
        },
        {
          "name": "email",
          "type": "VARCHAR(255)",
          "nullable": false,
          "isPrimary": false,
          "description": "User email address"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": false,
          "isPrimary": false
        }
      ]
    }
    ```

### Query Execution

- `POST /api/query/execute` - Execute SQL query (read-only)

  - **Request**: JSON body with query details
    ```json
    {
      "sql": "SELECT * FROM users WHERE created_at > '2023-01-01' LIMIT 100",
      "timeout": 30000 // optional timeout in milliseconds
    }
    ```
  - **Response**: JSON with query execution details
    ```json
    {
      "queryId": "q_12345",
      "status": "running|completed|error",
      "startTime": "2023-05-15T14:30:00Z",
      "results": {
        // included if status is "completed"
        "columns": [
          { "name": "id", "type": "INTEGER" },
          { "name": "email", "type": "VARCHAR" }
        ],
        "rows": [
          [1, "user1@example.com"],
          [2, "user2@example.com"]
        ],
        "rowCount": 2,
        "truncated": false // indicates if result set was truncated
      },
      "error": {
        // included if status is "error"
        "message": "Syntax error in SQL statement",
        "line": 1,
        "position": 10
      }
    }
    ```

- `GET /api/query/{queryId}/status` - Check execution status for long-running queries

  - **Request**: Path parameter `queryId` (from execute response)
  - **Response**: JSON with query status
    ```json
    {
      "queryId": "q_12345",
      "status": "running|completed|error",
      "startTime": "2023-05-15T14:30:00Z",
      "duration": 1250, // milliseconds elapsed
      "progress": 0.75, // estimated completion (0-1)
      "error": {
        // included if status is "error"
        "message": "Query timeout exceeded"
      }
    }
    ```

- `GET /api/query/{queryId}/results` - Get query results

  - **Request**:
    - Path parameter `queryId` (from execute response)
    - Query parameters:
      - `page`: Page number (default: 1)
      - `pageSize`: Number of rows per page (default: 100, max: 1000)
  - **Response**: JSON with query results
    ```json
    {
      "columns": [
        { "name": "id", "type": "INTEGER" },
        { "name": "email", "type": "VARCHAR" }
      ],
      "rows": [
        [1, "user1@example.com"],
        [2, "user2@example.com"]
      ],
      "rowCount": 2,
      "pageCount": 1,
      "currentPage": 1,
      "truncated": false
    }
    ```

- `GET /api/query/{queryId}/download/csv` - Download results as CSV
  - **Request**: Path parameter `queryId` (from execute response)
  - **Response**: CSV file as attachment
    - Content-Type: text/csv
    - Content-Disposition: attachment; filename="query_results.csv"

### Query Management (Optional)

- `GET /api/queries` - List saved queries

  - **Request**: Query parameters for pagination
    - `page`: Page number (default: 1)
    - `pageSize`: Number of queries per page (default: 20)
  - **Response**: JSON array of saved queries
    ```json
    {
      "queries": [
        {
          "id": "saved_1",
          "name": "Active Users",
          "sql": "SELECT * FROM users WHERE active = true",
          "createdAt": "2023-05-10T10:30:00Z",
          "updatedAt": "2023-05-12T14:45:00Z"
        },
        {
          "id": "saved_2",
          "name": "Recent Orders",
          "sql": "SELECT * FROM orders WHERE created_at > '2023-01-01'",
          "createdAt": "2023-04-20T09:15:00Z",
          "updatedAt": "2023-04-20T09:15:00Z"
        }
      ],
      "totalCount": 12,
      "pageCount": 1,
      "currentPage": 1
    }
    ```

- `POST /api/queries` - Save a query

  - **Request**: JSON with query details
    ```json
    {
      "name": "Active Users",
      "description": "Shows currently active user accounts",
      "sql": "SELECT * FROM users WHERE active = true"
    }
    ```
  - **Response**: JSON with saved query details
    ```json
    {
      "id": "saved_1",
      "name": "Active Users",
      "description": "Shows currently active user accounts",
      "sql": "SELECT * FROM users WHERE active = true",
      "createdAt": "2023-05-15T14:30:00Z",
      "updatedAt": "2023-05-15T14:30:00Z"
    }
    ```

- `GET /api/queries/{id}` - Get a saved query

  - **Request**: Path parameter `id` (saved query ID)
  - **Response**: JSON with query details
    ```json
    {
      "id": "saved_1",
      "name": "Active Users",
      "description": "Shows currently active user accounts",
      "sql": "SELECT * FROM users WHERE active = true",
      "createdAt": "2023-05-10T10:30:00Z",
      "updatedAt": "2023-05-12T14:45:00Z"
    }
    ```

- `PUT /api/queries/{id}` - Update a saved query

  - **Request**:
    - Path parameter `id` (saved query ID)
    - JSON body with query details to update
      ```json
      {
        "name": "Active Users - Updated",
        "description": "Shows active user accounts - updated",
        "sql": "SELECT * FROM users WHERE active = true ORDER BY last_login DESC"
      }
      ```
  - **Response**: JSON with updated query details
    ```json
    {
      "id": "saved_1",
      "name": "Active Users - Updated",
      "description": "Shows active user accounts - updated",
      "sql": "SELECT * FROM users WHERE active = true ORDER BY last_login DESC",
      "createdAt": "2023-05-10T10:30:00Z",
      "updatedAt": "2023-05-15T16:20:00Z"
    }
    ```

- `DELETE /api/queries/{id}` - Delete a saved query
  - **Request**: Path parameter `id` (saved query ID)
  - **Response**: Status 204 No Content on success

## Backend Implementation Plan

### Technology Stack

- NestJS framework (already set up in the project)
- TypeORM for database interactions
- PostgreSQL as the primary database
- pg npm package for PostgreSQL connection
- Shared types from @sql-editor/types library

### Module Structure

1. **Schema Module**

   - SchemaController: Handles schema discovery routes
   - SchemaService: Provides methods to fetch database schema information
   - DTOs: Using shared types from the types library

2. **Query Module**

   - QueryController: Handles query execution routes
   - QueryService: Executes SQL queries and manages query results
   - QueryExecutor: Low-level service for executing queries against the database
   - DTOs: Using shared types from the types library

3. **Query Management Module (Optional)**
   - SavedQueryController: Handles saved queries routes
   - SavedQueryService: Manages saved queries
   - SavedQuery entity: Represents a saved query in the database
   - DTOs: Using shared types from the types library

### Implementation Steps

1. **Database Connection**

   - Configure TypeORM to connect to PostgreSQL
   - Set up proper read-only permissions
   - Add configuration for different environments

2. **Schema Discovery Implementation**

   - Create methods to query PostgreSQL system catalogs (information_schema)
   - Implement table listing functionality
   - Implement detailed table information retrieval
   - Use shared types for responses

3. **Query Execution**

   - Build a secure SQL query executor with validation
   - Implement query execution with proper error handling
   - Set up query result pagination and storage
   - Add CSV export functionality
   - Use shared types for requests and responses

4. **Query Management (Optional)**

   - Create database schema for saved queries
   - Implement CRUD operations for saved queries
   - Add user-specific query saving (if authentication is implemented)
   - Use shared types for requests and responses

5. **Security Considerations**

   - Implement SQL injection protection
   - Add rate limiting for query execution
   - Set up query timeout mechanisms
   - Ensure proper error handling that doesn't expose sensitive information

6. **Performance Optimizations**
   - Cache schema information
   - Limit result set size for large queries
   - Implement query cancellation for long-running queries
   - Utilize connection pooling for better performance

## Frontend Implementation Plan

### Technology Stack

- React with TypeScript for UI components
- TailwindCSS for styling
- Monaco Editor for SQL editing with syntax highlighting
- React Query for API data fetching and caching
- TanStack Table for the results table with sorting/resizing
- React Split Pane for resizable panels
- Zustand for state management
- Shared types from @sql-editor/types library

### Application Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── SplitPane.tsx
│   │   └── Footer.tsx
│   ├── schema/
│   │   ├── SchemaExplorer.tsx
│   │   ├── TableList.tsx
│   │   └── TableDetails.tsx
│   ├── editor/
│   │   ├── SQLEditor.tsx          # Monaco Editor integration
│   │   └── EditorToolbar.tsx
│   └── results/
│       ├── ResultsTable.tsx
│       ├── Pagination.tsx
│       └── ExportButton.tsx
├── hooks/
│   ├── useSchema.ts
│   ├── useQuery.ts
│   └── useQueryHistory.ts
├── services/
│   ├── api.ts                    # TypeScript API client using shared types
│   ├── schemaService.ts
│   └── queryService.ts
├── store/
│   ├── schema.ts                 # Zustand store with shared types
│   ├── query.ts
│   └── history.ts
```

### UI Layout

```
+--------------------------------------------+
|  SQL Editor                                |
+--------------------------------------------+
|                                            |
| +-------------+  +----------------------+  |
| | SCHEMA      |  | SQL EDITOR           |  |
| |-------------|  |----------------------|  |
| | ▼ Users     |  | SELECT * FROM users  |  |
| |   - id      |  | WHERE id > 10        |  |
| |   - name    |  | LIMIT 100;           |  |
| |   - email   |  |                      |  |
| | ▶ Orders    |  |                      |  |
| | ▶ Products  |  | [Execute Query]      |  |
| |             |  +----------------------+  |
| |             |                            |
| |             |  +----------------------+  |
| |             |  | RESULTS   [Export]   |  |
| |             |  |----------------------|  |
| |             |  | id | name  | email   |  |
| |             |  |----+-------+---------|  |
| |             |  | 11 | John  | j@e.com |  |
| |             |  | 12 | Jane  | j@e.com |  |
| |             |  | 13 | Alex  | a@e.com |  |
| |             |  |                      |  |
| |             |  | Rows: 1-3 of 90 [1]  |  |
| |             |  | Time: 125ms          |  |
| +-------------+  +----------------------+  |
+--------------------------------------------+
```

### Implementation Steps

1. **Project Setup**

   - Configure React with TypeScript
   - Set up TailwindCSS
   - Install required dependencies (Monaco Editor, React Query, etc.)
   - Configure API client using shared types from @sql-editor/types

2. **Layout Implementation**

   - Create the main application layout with resizable panels
   - Implement header, footer, and navigation components
   - Set up responsive design for different screen sizes

3. **Schema Explorer**

   - Build table list component with expandable/collapsible tree view
   - Implement schema fetching from the backend API with shared types
   - Display table details with column information
   - Add search/filter functionality for tables and columns

4. **SQL Editor**

   - Integrate Monaco Editor with SQL syntax highlighting
   - Implement auto-completion using schema information
   - Add SQL formatting capabilities
   - Build query execution toolbar with run button

5. **Query Results**

   - Develop results table with resizable columns
   - Implement pagination for large result sets
   - Add sorting functionality for columns
   - Create CSV export functionality
   - Display query execution statistics

6. **State Management**

   - Implement state management using Zustand with shared types
   - Set up caching for schema and query results
   - Store query history for easy access to previous queries

7. **Error Handling**

   - Create error display components
   - Implement error handling for API requests
   - Show syntax errors in the editor with highlighting

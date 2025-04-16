# SQL Editor Backend

This is the backend for the SQL Editor application, built with NestJS and PostgreSQL.

## Features

- **Schema Discovery API**: Explore database tables and their structure
- **Query Execution API**: Execute read-only SQL queries and retrieve results
- **Query Management API**: Save and retrieve queries (optional)

## Prerequisites

- Node.js v16+
- PostgreSQL 12+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Copy `.env.example` to `.env` and update the variables according to your PostgreSQL setup:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run serve
```

The server will be available at http://localhost:3000/api

## API Endpoints

### Schema Discovery

- `GET /api/schema/tables` - List all tables in the schema
- `GET /api/schema/tables/{table}` - Get detailed information about a specific table

### Query Execution

- `POST /api/query/execute` - Execute a read-only SQL query
- `GET /api/query/{queryId}/status` - Check execution status
- `GET /api/query/{queryId}/results` - Get query results
- `GET /api/query/{queryId}/download/csv` - Download results as CSV

## Development

### Running in Development Mode

```bash
npm run serve
```

### Building for Production

```bash
npm run build
```

## Security Notes

- The application is configured to allow only read-only queries by default
- All SQL queries are validated to prevent mutations
- Query timeouts are implemented to prevent long-running queries
- Response size limits are in place to prevent memory issues

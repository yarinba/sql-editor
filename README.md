# SQL Editor Application

A web application with functionality similar to Metabase's query editor for connecting to and exploring a PostgreSQL database. The application allows users to write SQL queries, browse database schema, and view query results in a clean, interactive interface.

## Project Structure

This project is organized as a monorepo using Nx, with the following structure:

```
/sql-editor
  /apps
    /be              # NestJS backend application
    /fe              # React frontend application
  /libs
    /types           # Shared TypeScript types library
  /infra             # Infrastructure configuration
    /postgres        # PostgreSQL configuration
      /init-db       # Database initialization scripts
```

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js and npm (for local development)

### Starting the Database with Sample Data

The quickest way to get started is using Docker Compose:

```bash
# Start PostgreSQL with sample data
npm run infra:up
```

This will:

- Start a PostgreSQL container on port 5432
- Create and seed tables (users, products, orders) with 1,500 rows each
- The seed data provides a comprehensive dataset for testing and development

### Starting the Application

After setting up the database, you can start both the frontend and backend applications with a single command:

```bash
npm start
```

This runs the NestJS backend and React frontend concurrently using Nx.

### PostgreSQL Database Connection Details

- **Host**: localhost
- **Port**: 5432 (default in docker-compose.yml)
- **Username**: postgres
- **Password**: postgres
- **Database**: postgres
- **Schema**: public

### Sample Data Overview

The database contains three main tables:

1. **Users**

   - Fields: id, name, email, active, last_login, created_at
   - Includes a mix of predefined users and randomly generated data

2. **Products**

   - Fields: id, name, description, price, category, created_at
   - Contains various product categories (Electronics, Accessories, Office, etc.)

3. **Orders**
   - Fields: id, user_id, order_date, amount, status
   - Various statuses: pending, shipped, delivered, cancelled

## Features

- **Interactive SQL Editor**

  - Syntax highlighting
  - Auto-completion based on schema
  - Error highlighting

- **Schema Explorer**

  - Displays tables and columns in an expandable tree view
  - Shows column types and metadata

- **Query Results**
  - Interactive table with sortable columns
  - Pagination for large result sets
  - Export results as CSV

## Database Management

### Reset Data

To completely reset the database (including removing volumes):

```bash
docker-compose down -v
```

Then start it again:

```bash
docker-compose up -d postgres
```

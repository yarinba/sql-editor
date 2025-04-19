# Query Module - Technical Documentation

## Current Implementation

The Query Module provides functionality for executing SQL queries against the PostgreSQL database and retrieving results.

### Key Components

- **QueryService**: Core service handling query execution, result storage, and CSV generation
- **QueryController**: REST API endpoints for query execution and result retrieval
- **In-memory Storage**: Active queries and results are stored in a Map (`activeQueries`)

### Features

- **Asynchronous Execution**: Queries run asynchronously with proper timeout handling
- **Security Validation**: Enforces read-only queries (SELECT statements only)
- **Result Pagination**: Supports paginated access to large result sets
- **CSV Export**: Generates downloadable CSV files from query results
- **Resource Management**: Automatically cleans up query resources after 5 minutes

### Technical Details

- **Query Timeout**: Default is 30 seconds, configurable per query
- **Maximum Rows**: Returns up to 10,000 rows by default (truncates larger results)
- **CSV Export Limit**: Up to 100,000 rows for CSV export
- **Schema Configuration**: Uses configurable database schema (defaults to 'public')

## Current Limitations

1. **In-memory Storage Only**

   - Query results persist only in server memory
   - Results are lost on server restart
   - No persistence across sessions
   - Memory usage scales with number of active queries and result sizes

2. **Temporary Storage Period**

   - Query results are automatically cleaned up after 5 minutes
   - No way to extend retention for important queries

3. **Missing Features**

   - No saved query functionality (save, list, update, delete)
   - No user association for queries
   - No query history tracking
   - No sharing capabilities

4. **Performance Considerations**
   - Large result sets may impact server memory usage
   - No caching mechanism for repeated queries
   - No query cancellation mechanism

## Planned Improvements

### 1. Persistent Query Storage

- Implement TypeORM entity for saved queries
- Support naming and describing queries
- Add functionality to update and delete saved queries
- Include metadata like creation and modification timestamps

### 2. User Association

- Associate queries with specific users
- Implement permissions for query access and modification
- Support personal and shared queries

### 3. Enhanced Result Management

- Implement configurable retention periods
- Add option for permanent storage of important query results
- Implement result caching for frequently-run queries

### 4. Additional Features

- Query history tracking
- Query templates
- Parameterized queries
- Query performance metrics
- Scheduled query execution

## Optimized Storage and Performance Architecture

### Query Result Caching Strategy

We will implement a content-based caching strategy with the following characteristics:

1. **Query Hash as Cache Key**

   - Generate a SHA-256 hash of the normalized SQL query
   - Use this hash as the Redis key for storing results
   - Automatically reuse results for identical queries
   - Include optional parameters in the hash for parameterized queries

2. **Redis as Primary Cache Storage**

   - Store query results in Redis with a 12-hour TTL
   - Set automatic expiration to enforce retention policy
   - Track cache hit rate for performance analytics
   - Support explicit cache bypassing when needed

3. **Cache Invalidation**
   - Implement table-based invalidation for data changes
   - Scan cached queries for references to modified tables
   - Provide API for manual cache invalidation
   - Record invalidation events for auditing

### Implementation Details

```typescript
// Sample Redis caching implementation
@Injectable()
export class QueryCacheService {
  private readonly RESULTS_TTL = 12 * 60 * 60; // 12 hours in seconds

  constructor(private redisService: RedisService, private logger: Logger) {}

  private generateQueryHash(sql: string): string {
    // Normalize query by removing whitespace variations
    const normalizedSql = sql.trim().replace(/\s+/g, ' ').toLowerCase();
    // Generate hash
    return crypto.createHash('sha256').update(normalizedSql).digest('hex');
  }

  async getCachedResults(sql: string): Promise<QueryResultsDto | null> {
    const queryHash = this.generateQueryHash(sql);
    const results = await this.redisService.get(`query:hash:${queryHash}:results`);

    if (results) {
      // Extend TTL and track cache hit
      await this.redisService.expire(`query:hash:${queryHash}:results`, this.RESULTS_TTL);
      await this.redisService.incr(`query:hash:${queryHash}:hits`);
      return results;
    }

    return null;
  }

  async cacheQueryResults(sql: string, results: QueryResultsDto): Promise<void> {
    const queryHash = this.generateQueryHash(sql);

    // Store results with TTL
    await this.redisService.set(`query:hash:${queryHash}:results`, results, this.RESULTS_TTL);

    // Store original SQL for reference
    await this.redisService.set(`query:hash:${queryHash}:sql`, sql, this.RESULTS_TTL);
  }
}
```

### Performance Optimization Techniques

1. **Streaming Large Results**

   - Implement database streaming for large result sets
   - Return chunks of data progressively to clients
   - Support websocket connections for real-time updates
   - Reduce memory pressure for large queries

2. **Background Processing for Long Queries**

   - Implement a job queue for long-running queries
   - Process resource-intensive queries asynchronously
   - Notify users when queries complete
   - Prioritize queries based on importance

3. **Query Cancellation**
   - Allow users to cancel running queries
   - Release database and server resources promptly
   - Track query resource usage in real-time
   - Implement automatic cancellation for runaway queries

### Metadata Storage Architecture

1. **PostgreSQL for Query Metadata**

   - Store definitions, execution history, and user associations
   - Track query performance metrics and usage patterns
   - Maintain relationships between queries and users
   - Support advanced filtering and searching

2. **Redis for Active Results (12-hour retention)**
   - Store query results with automatic expiration
   - Support high-throughput access patterns
   - Optimize for read performance and memory efficiency
   - Implement tiered storage for result previews vs. full results

### Implementation Plan

1. **Phase 1: Cache Implementation**

   - Set up Redis connection and service
   - Implement query hashing and normalization
   - Add cache lookup to query execution flow
   - Develop basic cache invalidation mechanism

2. **Phase 2: Result Storage Optimization**

   - Migrate from in-memory Map to Redis storage
   - Implement 12-hour TTL for all results
   - Update controllers to handle cache hits
   - Add metadata tracking in PostgreSQL

3. **Phase 3: Performance Enhancements**

   - Implement streaming for large results
   - Add background processing for long queries
   - Develop query cancellation functionality
   - Create performance monitoring dashboards

4. **Phase 4: Advanced Features**
   - Implement parameterized queries with cache support
   - Add query templates and sharing
   - Develop scheduling functionality
   - Create comprehensive analytics for query patterns

## API Endpoints

### Currently Implemented

- `POST /api/query/execute` - Execute a SQL query
- `GET /api/query/{queryId}/status` - Check execution status
- `GET /api/query/{queryId}/results` - Get paginated query results
- `GET /api/query/{queryId}/download/csv` - Download results as CSV

### Planned (Not Yet Implemented)

- `GET /api/queries` - List saved queries
- `POST /api/queries` - Save a new query
- `GET /api/queries/{id}` - Get a specific saved query
- `PUT /api/queries/{id}` - Update a saved query
- `DELETE /api/queries/{id}` - Delete a saved query
- `GET /api/query/history` - Get query execution history
- `POST /api/query/cancel/{queryId}` - Cancel a running query
- `GET /api/query/cache/stats` - Get cache statistics
- `DELETE /api/query/cache/invalidate` - Invalidate cache for specific tables

## Implementation Notes

### Query Persistence

For implementing saved queries, we'll need:

1. Create a TypeORM entity:

   ```typescript
   @Entity()
   export class SavedQuery {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     @Column()
     name: string;

     @Column({ nullable: true })
     description: string;

     @Column({ type: 'text' })
     sql: string;

     @Column({ nullable: true })
     userId: string;

     @CreateDateColumn()
     createdAt: Date;

     @UpdateDateColumn()
     updatedAt: Date;
   }
   ```

2. Add a SavedQueryService with CRUD operations

3. Implement SavedQueryController with REST endpoints

### Query Execution Tracking

For tracking query executions:

```typescript
@Entity()
export class QueryExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  sql: string;

  @Column({ nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['running', 'completed', 'error', 'cancelled'],
    default: 'running',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  error: any;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'int', nullable: true })
  rowCount: number;

  @Column({ type: 'boolean', default: false })
  truncated: boolean;

  @Column({ type: 'varchar', nullable: true })
  resultStorageType: 'redis' | 'expired' | null;

  @Column({ type: 'timestamp', nullable: true })
  resultExpiration: Date;

  @Column({ type: 'varchar', nullable: true })
  cacheKey: string;

  @Column({ type: 'boolean', default: false })
  fromCache: boolean;
}
```

### Security Considerations

- Continue enforcing read-only queries
- Implement proper SQL injection protection
- Add rate limiting for query execution
- Set up query timeout mechanisms
- Ensure proper error handling that doesn't expose sensitive information

## Handling Large Result Sets

### Limitations of Full Result Caching

Storing complete result sets in Redis presents several challenges:

1. **Memory Consumption**: Large result sets (millions of rows) would consume excessive Redis memory
2. **Initial Query Load**: The full query must be executed once and all results loaded into memory
3. **Inefficient for Pagination**: We store the full dataset when users typically view only a small portion
4. **Redis Size Limits**: Redis values have practical size limits (typically 512MB)

### Optimized Approach for Large Results

Instead of caching full result sets, we'll implement a more efficient strategy:

#### 1. Query Metadata and First Page Caching

```typescript
@Injectable()
export class QueryCacheService {
  // ...existing code...

  async cacheQueryMetadata(sql: string, results: QueryFirstPageResult): Promise<void> {
    const queryHash = this.generateQueryHash(sql);

    // Store only metadata and first page
    await this.redisService.set(
      `query:hash:${queryHash}:metadata`,
      {
        columns: results.columns,
        totalRows: results.totalRows,
        firstPage: results.rows.slice(0, 100),
        executionTime: results.executionTime,
        executionDate: new Date().toISOString(),
      },
      this.RESULTS_TTL
    );

    // Store original SQL for reference
    await this.redisService.set(`query:hash:${queryHash}:sql`, sql, this.RESULTS_TTL);
  }

  async getQueryMetadata(sql: string): Promise<QueryMetadata | null> {
    const queryHash = this.generateQueryHash(sql);
    return this.redisService.get(`query:hash:${queryHash}:metadata`);
  }
}
```

#### 2. Database-native Pagination

Execute pagination directly at the database level, rather than in application memory:

```typescript
@Injectable()
export class QueryService {
  // ...existing code...

  async getQueryPage(sql: string, page: number, pageSize: number): Promise<PagedResults> {
    const queryHash = this.generateQueryHash(sql);
    const metadata = await this.queryCacheService.getQueryMetadata(sql);

    // If metadata exists, we have a cached query
    if (metadata) {
      // For first page, return cached data if available
      if (page === 1 && metadata.firstPage) {
        return {
          rows: metadata.firstPage,
          columns: metadata.columns,
          totalRows: metadata.totalRows,
          currentPage: 1,
          totalPages: Math.ceil(metadata.totalRows / pageSize),
          fromCache: true,
        };
      }

      // For other pages, execute paginated query
      const offset = (page - 1) * pageSize;

      // Use CTE to wrap the original query for pagination
      const paginatedSql = `WITH original_query AS (${sql}) 
                          SELECT * FROM original_query 
                          LIMIT ${pageSize} OFFSET ${offset}`;

      const pageResults = await this.executeRawQuery(paginatedSql);

      return {
        rows: pageResults.rows,
        columns: metadata.columns,
        totalRows: metadata.totalRows,
        currentPage: page,
        totalPages: Math.ceil(metadata.totalRows / pageSize),
        fromCache: true,
      };
    }

    // No cache hit, execute full query with count
    return this.executeFullQueryWithPagination(sql, page, pageSize);
  }

  private async executeFullQueryWithPagination(sql: string, page: number, pageSize: number): Promise<PagedResults> {
    // Execute count query to get total rows
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) AS count_query`;
    const countResult = await this.executeRawQuery(countSql);
    const totalRows = parseInt(countResult.rows[0].total);

    // Execute paginated query for requested page
    const offset = (page - 1) * pageSize;
    const paginatedSql = `WITH original_query AS (${sql}) 
                        SELECT * FROM original_query 
                        LIMIT ${pageSize} OFFSET ${offset}`;

    const result = await this.executeRawQuery(paginatedSql);

    // Cache metadata and first page if this is page 1
    if (page === 1) {
      await this.queryCacheService.cacheQueryMetadata(sql, {
        columns: result.columns,
        rows: result.rows,
        totalRows,
        executionTime: new Date().getTime() - startTime.getTime(),
      });
    }

    return {
      rows: result.rows,
      columns: result.columns,
      totalRows,
      currentPage: page,
      totalPages: Math.ceil(totalRows / pageSize),
      fromCache: false,
    };
  }
}
```

#### 3. Keyset Pagination for Improved Performance

For even better performance with large datasets, implement keyset pagination:

```typescript
async getNextPageByKey(
  sql: string,
  keyColumn: string,
  lastKeyValue: any,
  sortDirection: 'ASC' | 'DESC',
  pageSize: number
): Promise<KeysetPagedResults> {
  const queryHash = this.generateQueryHash(sql);
  const metadata = await this.queryCacheService.getQueryMetadata(sql);

  // Extract the base query (remove existing ORDER BY and LIMIT clauses)
  const baseQuery = sql.replace(/ORDER BY.+?(LIMIT|$)/i, '$1').trim()
                       .replace(/LIMIT.+?$/i, '').trim();

  // Direction comparison operator
  const operator = sortDirection === 'ASC' ? '>' : '<';

  // Create keyset paginated query
  const keysetSql = `WITH original_query AS (${baseQuery})
                    SELECT * FROM original_query
                    WHERE ${keyColumn} ${operator} $1
                    ORDER BY ${keyColumn} ${sortDirection}
                    LIMIT ${pageSize}`;

  const pageResults = await this.executeParameterizedQuery(keysetSql, [lastKeyValue]);

  // If first request (lastKeyValue is null), also cache metadata
  if (lastKeyValue === null) {
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${baseQuery}) AS count_query`;
    const countResult = await this.executeRawQuery(countSql);
    const totalRows = parseInt(countResult.rows[0].total);

    await this.queryCacheService.cacheQueryMetadata(sql, {
      columns: pageResults.columns,
      rows: pageResults.rows,
      totalRows,
      executionTime: pageResults.executionTime
    });

    return {
      rows: pageResults.rows,
      columns: pageResults.columns,
      totalRows,
      hasMore: pageResults.rows.length === pageSize,
      lastKey: pageResults.rows.length > 0
               ? pageResults.rows[pageResults.rows.length - 1][keyColumn]
               : null
    };
  }

  // Return next page
  return {
    rows: pageResults.rows,
    columns: metadata?.columns || pageResults.columns,
    totalRows: metadata?.totalRows,
    hasMore: pageResults.rows.length === pageSize,
    lastKey: pageResults.rows.length > 0
             ? pageResults.rows[pageResults.rows.length - 1][keyColumn]
             : null
  };
}
```

#### 4. Result Set Size Detection

Implement intelligent handling based on result size:

```typescript
async executeQuery(sql: string): Promise<QueryExecutionResult> {
  // First execute a query to check result size
  const sampleSql = `${sql} LIMIT 10`;
  const estimateCountSql = `SELECT COUNT(*) as estimate FROM (${sql} LIMIT 10000) AS sample`;

  const [sampleResult, countEstimate] = await Promise.all([
    this.executeRawQuery(sampleSql),
    this.executeRawQuery(estimateCountSql)
  ]);

  const estimatedRows = parseInt(countEstimate.rows[0].estimate);
  const hasLargeResultSet = estimatedRows >= 10000;

  // Store the sample and estimated size
  const queryId = uuidv4();
  await this.storeSampleResults(queryId, sql, sampleResult, estimatedRows);

  if (hasLargeResultSet) {
    // For large results, don't execute full query - require pagination
    return {
      queryId,
      status: 'sample_completed',
      message: 'Large result set detected, use pagination to retrieve full results',
      estimatedRows,
      sampleRows: sampleResult.rows,
      columns: sampleResult.columns
    };
  } else {
    // For smaller results, execute and store full query in background
    this.executeAndStoreFullQuery(queryId, sql);

    return {
      queryId,
      status: 'running',
      message: 'Query execution started',
      estimatedRows,
      sampleRows: sampleResult.rows,
      columns: sampleResult.columns
    };
  }
}
```

### API Endpoints for Paginated Results

Add specialized endpoints for efficient pagination:

```
GET /api/query/{queryId}/page/{page}?pageSize=100
```

```
GET /api/query/{queryId}/next?keyColumn=id&lastKey=1000&direction=ASC&pageSize=100
```

### Benefits of This Approach

1. **Reduced Memory Usage**: Only metadata and first page stored in Redis
2. **Database-Native Pagination**: Leverage PostgreSQL's efficient pagination
3. **Improved Performance**: Keyset pagination for large datasets
4. **Responsive UI**: First page available immediately from cache
5. **Reduced Database Load**: Count queries executed only once per unique query

### Implementation Considerations

1. **Complex Queries**: Complex queries with joins and aggregations may require special handling
2. **Sorting**: Ensure consistent sorting for paginated results
3. **Query Timeout**: Set appropriate timeouts for count queries
4. **Cache Invalidation**: Same cache invalidation strategy applies to metadata

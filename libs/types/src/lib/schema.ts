/**
 * Types for database schema information
 */

/**
 * Represents a database column with its metadata
 */
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  description?: string;
}

/**
 * Represents a database table with basic information
 */
export interface Table {
  name: string;
  description?: string;
  rowCount?: number;
}

/**
 * Represents a database table with detailed information including columns
 */
export interface TableDetails extends Table {
  columns: Column[];
}

/**
 * Schema API response types
 */
export type GetTablesResponse = Table[];
export type GetTableDetailsResponse = TableDetails;

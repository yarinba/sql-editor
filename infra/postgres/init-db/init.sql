-- Ensure tables are dropped cleanly if they exist (with CASCADE for dependencies)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert 1,500 users with a single statement
INSERT INTO users (name, email, active, last_login, created_at)
SELECT
    'User ' || i AS name,
    'user' || i || '@example.com' AS email,
    true AS active, -- Defaulting all to active for simplicity, adjust if needed
    CASE WHEN random() < 0.7 THEN NOW() - (random() * 30) * interval '1 day' ELSE NULL END AS last_login,
    NOW() - (random() * 730) * interval '1 day' AS created_at
FROM generate_series(1, 1500) AS i;

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert 1,500 products with a single statement
INSERT INTO products (name, description, price, category, created_at)
SELECT
    'Product ' || chr(65 + floor(random() * 26)::int) || '-' || i AS name,
    CASE WHEN random() < 0.7 THEN 'Description for product ' || i ELSE NULL END AS description,
    round((random() * 1000 + 10)::numeric, 2) AS price,
    CASE floor(random() * 8)::int
        WHEN 0 THEN 'Electronics'
        WHEN 1 THEN 'Accessories'
        WHEN 2 THEN 'Office'
        WHEN 3 THEN 'Software'
        WHEN 4 THEN 'Audio'
        WHEN 5 THEN 'Office Furniture'
        WHEN 6 THEN 'Gadgets'
        ELSE 'Other'
    END AS category,
    NOW() - (random() * 365) * interval '1 day' AS created_at
FROM generate_series(1, 9000) AS i;

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending'
);

-- Insert 1,500 orders with a single statement
INSERT INTO orders (user_id, order_date, amount, status)
SELECT
    floor(random() * 1500 + 1)::int AS user_id, -- Random user_id between 1 and 1500
    NOW() - (random() * 730) * interval '1 day' AS order_date, -- Random date within the last 2 years
    round((random() * 1000 + 10)::numeric, 2) AS amount, -- Random amount between 10.00 and 1010.00
    CASE floor(random() * 4)::int
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'shipped'
        WHEN 2 THEN 'delivered'
        ELSE 'cancelled'
    END AS status
FROM generate_series(1, 20000) AS i;

-- Add indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category);

-- Grant permissions if using the schema defined in the environment file
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres; 
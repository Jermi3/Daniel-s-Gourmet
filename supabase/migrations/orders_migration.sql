/*
  # Orders Management Schema

  1. New Tables
    - `orders`: Stores customer order information
    - `order_items`: Stores individual items in each order

  2. Security
    - Enable RLS on both tables
    - Add policies for read/write access
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  contact_number text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('dine-in', 'pickup', 'delivery')),
  address text,
  landmark text,
  party_size integer,
  preferred_time text,
  payment_method text NOT NULL,
  notes text,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  variation_name text,
  add_ons jsonb DEFAULT '[]',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_service_type ON orders(service_type);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Allow public read access on orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on orders"
  ON orders
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for order_items
CREATE POLICY "Allow public read access on order_items"
  ON order_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on order_items"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

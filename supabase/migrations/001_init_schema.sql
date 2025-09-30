/*
  # SERVESOFT Database Schema - Initial Setup

  1. New Tables
    - `users` - User accounts with role-based access (Customer, Staff, Manager, Admin)
    - `restaurants` - Restaurant profiles
    - `employment_records` - Links staff to restaurants
    - `menu_categories` - Food categories
    - `menu_items` - Menu items with modifiers
    - `tables` - Restaurant tables with states
    - `reservations` - Table reservations
    - `orders` - Customer orders (Table, Pre-order, Delivery)
    - `order_items` - Order line items with snapshots
    - `delivery_assignments` - Delivery driver assignments
    - `announcements` - Staff announcements
    - `addresses` - Customer delivery addresses

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Restrict data access based on user role and ownership
*/

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN');
CREATE TYPE employment_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE staff_role_type AS ENUM ('SERVER', 'KITCHEN', 'DRIVER');
CREATE TYPE table_state AS ENUM ('FREE', 'HELD', 'SEATED', 'CLEANING');
CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'COMPLETED');
CREATE TYPE order_type AS ENUM ('TABLE', 'PREORDER', 'DELIVERY');
CREATE TYPE order_status AS ENUM ('RECEIVED', 'IN_PREP', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'FAILED');
CREATE TYPE delivery_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role DEFAULT 'CUSTOMER' NOT NULL,
  is_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  phone text NOT NULL,
  address text NOT NULL,
  town_city text NOT NULL,
  opening_hours jsonb DEFAULT '{}',
  delivery_zones text,
  pre_order_lead_time_minutes int DEFAULT 30,
  delivery_fee_amount decimal(10,2) DEFAULT 0,
  min_order_amount decimal(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  staff_role staff_role_type NOT NULL,
  status employment_status DEFAULT 'ACTIVE',
  hired_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  modifiers jsonb DEFAULT '[]',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number text NOT NULL,
  capacity int NOT NULL,
  position_x int DEFAULT 0,
  position_y int DEFAULT 0,
  state table_state DEFAULT 'FREE',
  qr_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  party_size int NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  notes text,
  status reservation_status DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  neighborhood text,
  town_city text NOT NULL,
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
  address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  order_type order_type NOT NULL,
  status order_status DEFAULT 'RECEIVED',
  scheduled_for timestamptz,
  customer_name text,
  customer_phone text,
  delivery_address jsonb,
  subtotal decimal(10,2) NOT NULL,
  service_fee decimal(10,2) DEFAULT 0,
  delivery_fee decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  notes text,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_snapshot jsonb NOT NULL,
  quantity int NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status delivery_status DEFAULT 'PENDING',
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  failed_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  target_role staff_role_type,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_employment_restaurant ON employment_records(restaurant_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_delivery_assignments_driver ON delivery_assignments(driver_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Anyone can view active restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can view their restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = restaurants.id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Admins can manage restaurants"
  ON restaurants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Staff can view own employment"
  ON employment_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view restaurant employment"
  ON employment_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = employment_records.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Managers can manage restaurant employment"
  ON employment_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = employment_records.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Anyone can view active menu categories"
  ON menu_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage menu categories"
  ON menu_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = menu_categories.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Managers can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = menu_items.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Staff can view restaurant tables"
  ON tables FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records
      WHERE restaurant_id = tables.restaurant_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage tables"
  ON tables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = tables.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Customers can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can view restaurant reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records
      WHERE restaurant_id = reservations.restaurant_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = reservations.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Customers can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Customers can manage own addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can view restaurant orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records
      WHERE restaurant_id = orders.restaurant_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update restaurant orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employment_records
      WHERE restaurant_id = orders.restaurant_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employment_records
      WHERE restaurant_id = orders.restaurant_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view restaurant order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN employment_records er ON er.restaurant_id = o.restaurant_id
      WHERE o.id = order_items.order_id
      AND er.user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view own assignments"
  ON delivery_assignments FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update own assignments"
  ON delivery_assignments FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Managers can view restaurant delivery assignments"
  ON delivery_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN employment_records er ON er.restaurant_id = o.restaurant_id
      WHERE o.id = delivery_assignments.order_id
      AND er.user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage delivery assignments"
  ON delivery_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN employment_records er ON er.restaurant_id = o.restaurant_id
      JOIN users u ON u.id = er.user_id
      WHERE o.id = delivery_assignments.order_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE POLICY "Staff can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    target_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employment_records
      WHERE restaurant_id = announcements.restaurant_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employment_records er
      JOIN users u ON u.id = er.user_id
      WHERE er.restaurant_id = announcements.restaurant_id
      AND er.user_id = auth.uid()
      AND u.role IN ('MANAGER', 'ADMIN')
    )
  );

CREATE FUNCTION generate_order_code() RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := 'ORD-' || upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_order_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_code IS NULL THEN
    NEW.order_code := generate_order_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_code
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_code();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_delivery_assignments_updated_at
  BEFORE UPDATE ON delivery_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
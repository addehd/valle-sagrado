-- Create cart table for storing user cart items
CREATE TABLE IF NOT EXISTS cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_sku VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of user and product
  UNIQUE(user_id, product_sku)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_sku ON cart(product_sku);

-- Enable Row Level Security (RLS)
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Create policies for cart access
-- Users can only see their own cart items
CREATE POLICY "Users can view own cart items" ON cart
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items" ON cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON cart
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON cart
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cart_updated_at 
  BEFORE UPDATE ON cart 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 
-- Create receipts table for storing processed receipt data
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant VARCHAR(255),
  date DATE,
  total DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  raw_text TEXT,
  processed_data JSONB,
  file_name VARCHAR(255),
  file_type VARCHAR(10), -- jpg, png, pdf
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant ON receipts(merchant);
CREATE INDEX IF NOT EXISTS idx_receipts_processing_status ON receipts(processing_status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- Create GIN index for JSONB data
CREATE INDEX IF NOT EXISTS idx_receipts_processed_data ON receipts USING GIN (processed_data);

-- Enable Row Level Security (RLS)
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for receipts access
-- Users can only see their own receipts
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own receipts
CREATE POLICY "Users can insert own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own receipts
CREATE POLICY "Users can update own receipts" ON receipts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own receipts
CREATE POLICY "Users can delete own receipts" ON receipts
  FOR DELETE USING (auth.uid() = user_id);

-- Admin users can view all receipts (assuming admin role exists)
CREATE POLICY "Admins can view all receipts" ON receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_receipts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_receipts_updated_at 
  BEFORE UPDATE ON receipts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_receipts_updated_at_column();

-- Create a function to get receipt statistics for a user
CREATE OR REPLACE FUNCTION get_user_receipt_stats(user_uuid UUID)
RETURNS TABLE (
  total_receipts BIGINT,
  total_amount DECIMAL,
  avg_amount DECIMAL,
  receipts_this_month BIGINT,
  amount_this_month DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_receipts,
    COALESCE(SUM(r.total), 0) as total_amount,
    COALESCE(AVG(r.total), 0) as avg_amount,
    COUNT(CASE WHEN r.created_at >= date_trunc('month', NOW()) THEN 1 END)::BIGINT as receipts_this_month,
    COALESCE(SUM(CASE WHEN r.created_at >= date_trunc('month', NOW()) THEN r.total ELSE 0 END), 0) as amount_this_month
  FROM receipts r
  WHERE r.user_id = user_uuid AND r.processing_status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
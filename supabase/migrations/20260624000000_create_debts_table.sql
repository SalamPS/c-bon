-- Create debt type enum
CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');

-- Create debts table
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type debt_type NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount BIGINT NOT NULL,
  note TEXT,
  due_date DATE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX debts_user_id_idx ON debts(user_id);
CREATE INDEX debts_settled_at_idx ON debts(settled_at);
CREATE INDEX debts_type_idx ON debts(type);

-- Enable RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own debts
CREATE POLICY "Users can select their own debts"
  ON debts
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT their own debts
CREATE POLICY "Users can insert their own debts"
  ON debts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own debts
CREATE POLICY "Users can update their own debts"
  ON debts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own debts
CREATE POLICY "Users can delete their own debts"
  ON debts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Partner shift for swap requests (traded with shift_id)
ALTER TABLE time_off_requests
ADD COLUMN IF NOT EXISTS counter_shift_id uuid REFERENCES scheduled_shifts (id);

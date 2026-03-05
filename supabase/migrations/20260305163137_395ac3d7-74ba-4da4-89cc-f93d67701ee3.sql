
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, function_name)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No client-side access needed; only service role uses this table from edge functions.

-- OAuth: permitir usuarios sin contraseña (Google / GitHub)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_provider_id_idx
  ON users (oauth_provider, oauth_id)
  WHERE oauth_provider IS NOT NULL AND oauth_id IS NOT NULL;

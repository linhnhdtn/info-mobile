export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT UNIQUE,
  name TEXT,
  image TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  birthday TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  company TEXT,
  position TEXT,
  department TEXT,
  employee_id TEXT,
  work_email TEXT,
  work_phone TEXT,
  work_address TEXT,
  start_date TEXT,
  end_date TEXT,
  salary TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  all_day INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  color TEXT DEFAULT '#3B82F6',
  reminder_at TEXT,
  reminder_note TEXT,
  is_repeating INTEGER NOT NULL DEFAULT 0,
  repeat_rule TEXT,
  repeat_until TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_user_start ON events(user_id, start_date);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#FFFFFF',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_pinned ON notes(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  total_budget REAL NOT NULL,
  daily_allowances TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
`;

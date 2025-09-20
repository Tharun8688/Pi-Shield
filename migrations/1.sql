
CREATE TABLE analysis_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  content_type TEXT NOT NULL,
  content_text TEXT,
  credibility_score INTEGER,
  analysis_result TEXT,
  flags TEXT,
  recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE educational_tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_reports_user_id ON analysis_reports(user_id);
CREATE INDEX idx_analysis_reports_created_at ON analysis_reports(created_at);
CREATE INDEX idx_educational_tips_category ON educational_tips(category);

-- NeuroForge Nexus: Bug tracking schema (reference).
-- `projects` and `users` already exist. Hibernate creates `bugs` automatically.
-- Display IDs ("BUG-1") are built in application code: id stays a numeric key.

CREATE TABLE IF NOT EXISTS bugs (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  project_id     BIGINT NOT NULL,
  module_feature VARCHAR(100),
  environment    ENUM('Development','Staging','Production') NOT NULL,
  severity       ENUM('Low','Medium','High','Critical') NOT NULL,
  priority       ENUM('Low','Medium','High') NOT NULL,
  assigned_to    BIGINT NULL,
  reported_by    BIGINT NOT NULL,
  status         ENUM('New','Triaged','Assigned','In Progress','Fixed','Retest','Closed')
                 NOT NULL DEFAULT 'New',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bugs_project  FOREIGN KEY (project_id)  REFERENCES projects(id),
  CONSTRAINT fk_bugs_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
  CONSTRAINT fk_bugs_reporter FOREIGN KEY (reported_by) REFERENCES users(id),
  INDEX idx_bugs_status (status),
  INDEX idx_bugs_severity (severity),
  INDEX idx_bugs_project (project_id)
);

-- GET /api/bugs (filters are optional; unused ones are NULL)
SELECT CONCAT('BUG-', b.id) AS bug_key, b.*, p.name AS project_name, u.name AS assigned_to_name
FROM bugs b
JOIN projects p       ON p.id = b.project_id
LEFT JOIN users u     ON u.id = b.assigned_to
WHERE (? IS NULL OR b.status = ?)
  AND (? IS NULL OR b.severity = ?)
  AND (? IS NULL OR b.project_id = ?)
ORDER BY b.created_at DESC;

-- GET /api/bugs/stats
SELECT COUNT(*)                                                         AS total,
       SUM(status <> 'Closed')                                          AS open_bugs,
       SUM(severity = 'Critical' AND status <> 'Closed')                AS critical,
       SUM(status = 'Closed')                                           AS closed
FROM bugs;

-- PUT /api/bugs/:id (status transition)
UPDATE bugs SET status = ? WHERE id = ?;

-- DELETE /api/bugs/:id
DELETE FROM bugs WHERE id = ?;
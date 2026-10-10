-- Seeds one demo sprint under a project named 'flight ticket booking system'.
-- Change the project name in the WHERE clause below to match a project that
-- actually exists in your projects table before running this.

INSERT INTO sprints (name, project_id, goal, task_count, points, start_date, end_date, status)
SELECT
    'Sprint 1: User Authentication',
    p.id,
    'Deliver end-to-end login and registration for the booking platform',
    0,
    0,
    '2026-09-01',
    '2026-09-14',
    'Active'
FROM projects p
WHERE p.name = 'flight ticket booking system'
LIMIT 1;
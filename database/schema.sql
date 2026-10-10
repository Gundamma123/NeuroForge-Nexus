-- Reference only. Hibernate (ddl-auto=update) already created these tables
-- automatically when the backend started. Do NOT run this if the tables
-- already exist — it's here purely so your mentor can see the schema in
-- one place without needing to reverse-engineer it from MySQL Workbench.

CREATE TABLE IF NOT EXISTS sprints (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    project_id BIGINT,
    goal VARCHAR(500),
    task_count INT,
    points INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sprint_project FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    sprint_id BIGINT NOT NULL,
    assignee_id BIGINT,
    priority VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    story_points INT,
    due_date DATE,
    PRIMARY KEY (id),
    CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    CONSTRAINT fk_task_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sub_tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    task_id BIGINT NOT NULL,
    assignee_id BIGINT,
    status VARCHAR(255) NOT NULL,
    due_date DATE,
    PRIMARY KEY (id),
    CONSTRAINT fk_subtask_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_subtask_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=InnoDB;
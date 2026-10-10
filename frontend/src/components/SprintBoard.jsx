import TaskCard from "./TaskCard";

const COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

const SprintBoard = ({ tasks, onTaskClick, onStatusChange }) => {
  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const getAdjacent = (status) => {
    const idx = COLUMNS.indexOf(status);
    return {
      prev: idx > 0 ? COLUMNS[idx - 1] : null,
      next: idx < COLUMNS.length - 1 ? COLUMNS[idx + 1] : null,
    };
  };

  return (
    <div className="nf-kanban-board">
      {COLUMNS.map((status) => {
        const columnTasks = tasksByStatus(status);
        return (
          <div className="nf-kanban-column" key={status}>
            <div className="nf-kanban-column-header">
              <span>{status}</span>
              <span className="nf-badge">{columnTasks.length}</span>
            </div>

            <div className="nf-kanban-column-body">
              {columnTasks.map((task) => {
                const { prev, next } = getAdjacent(task.status);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onStatusChange={onStatusChange}
                    prevStatus={prev}
                    nextStatus={next}
                  />
                );
              })}

              {columnTasks.length === 0 && (
                <div className="nf-kanban-empty">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SprintBoard;
// Single source of truth for every Create/Edit form's outer shell.
// Guarantees identical width, padding, grid split, and button placement
// across Project, Sprint, Task, and Subtask forms — no per-page drift.

const FormShell = ({ error, children, main, sidebar, actions, asPanel = true }) => {
  const content = (
    <>
      {error && <div className="nf-form-error">{error}</div>}
      <div className="nf-task-form-grid">
        <div className="nf-task-form-main">{main}</div>
        <div className="nf-task-form-sidebar">{sidebar}</div>
        <div className="nf-task-form-actions">{actions}</div>
      </div>
    </>
  );

  if (!asPanel) return content; // used when already inside a <Modal>

  return (
    <div className="nf-panel nf-modal-wide">
      {content}
    </div>
  );
};

export default FormShell;
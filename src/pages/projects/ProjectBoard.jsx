import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Icon from "../../components/Icon";
import Avatar from "../../components/Avatar";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProjectFormModal from "../../components/ProjectFormModal";
import TaskFormModal from "../../components/TaskFormModal";

const COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, updateProject, deleteProject, addTask, updateTask, deleteTask } = useData();
  const { showToast } = useToast();

  const project = projects.find((p) => p.id === id);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskColumnDraft, setTaskColumnDraft] = useState("todo");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  if (!project) {
    return (
      <div className="empty-state">
        <h3>Project not found</h3>
        <p>It may have been deleted.</p>
        <Link to="/projects" className="btn btn-secondary" style={{ display: "inline-flex" }}>Back to projects</Link>
      </div>
    );
  }

  const projTasks = tasks.filter((t) => t.projectId === id);

  function openNewTask(col) {
    setEditingTask(null);
    setTaskColumnDraft(col);
    setTaskModalOpen(true);
  }
  function openEditTask(t) {
    setEditingTask(t);
    setTaskColumnDraft(t.status);
    setTaskModalOpen(true);
  }
  function handleSaveTask(data) {
    if (editingTask) {
      updateTask(editingTask.id, data);
      showToast("Task updated.");
    } else {
      addTask({ ...data, projectId: id, status: taskColumnDraft });
      showToast("Task added.");
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  }
  function moveTask(taskId, status) {
    updateTask(taskId, { status });
  }
  function handleDeleteTask() {
    deleteTask(confirmDeleteTask.id);
    showToast("Task deleted.");
    setConfirmDeleteTask(null);
  }
  function handleSaveProject(data) {
    updateProject(id, data);
    showToast("Project updated.");
    setProjectModalOpen(false);
  }
  function handleDeleteProject() {
    deleteProject(id);
    showToast("Project deleted.");
    navigate("/projects");
  }

  function onDragStart(taskId) { setDraggingId(taskId); }
  function onDragOverCol(colId, e) { e.preventDefault(); setDragOverCol(colId); }
  function onDropCol(colId) {
    if (draggingId) moveTask(draggingId, colId);
    setDraggingId(null);
    setDragOverCol(null);
  }

  return (
    <div>
      <Link to="/projects" className="auth-back">← All projects</Link>

      <div className="project-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="project-color-dot" style={{ width: 14, height: 14, background: `var(--${project.color})` }} />
          <div>
            <h1 className="page-title" style={{ fontSize: "1.5rem" }}>{project.name}</h1>
            {project.description && <p className="page-sub">{project.description}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {project.collaborators?.length > 0 && (
            <div className="collab-stack">
              {project.collaborators.map((c) => <Avatar key={c} name={c} size={28} />)}
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setProjectModalOpen(true)}><Icon name="edit" size={14} /> Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteProject(true)}><Icon name="trash" size={14} /></button>
        </div>
      </div>

      <div className="board-wrap">
        {COLUMNS.map((col) => {
          const colTasks = projTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`board-col ${dragOverCol === col.id ? "is-drop-target" : ""}`}
              onDragOver={(e) => onDragOverCol(col.id, e)}
              onDrop={() => onDropCol(col.id)}
              onDragLeave={() => setDragOverCol(null)}
            >
              <div className="board-col-head">
                <h4>{col.label}</h4>
                <span className="board-col-count">{colTasks.length}</span>
              </div>
              <div className="board-cards">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="task-card"
                    draggable
                    onDragStart={() => onDragStart(t.id)}
                    onClick={() => openEditTask(t)}
                  >
                    <p className="title">{t.title}</p>
                    {(t.dueDate) && (
                      <div className="task-meta">
                        <Icon name="calendar" size={12} /> {t.dueDate}
                      </div>
                    )}
                    <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                      {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                        <button key={c.id} className="move-btn" onClick={() => moveTask(t.id, c.id)}>→ {c.label}</button>
                      ))}
                      <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={() => setConfirmDeleteTask(t)} aria-label="Delete task"><Icon name="trash" size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 10, justifyContent: "flex-start" }} onClick={() => openNewTask(col.id)}>
                <Icon name="plus" size={14} /> Add task
              </button>
            </div>
          );
        })}
      </div>

      <TaskFormModal open={taskModalOpen} initial={editingTask} onSave={handleSaveTask} onCancel={() => { setTaskModalOpen(false); setEditingTask(null); }} />
      <ProjectFormModal open={projectModalOpen} initial={project} onSave={handleSaveProject} onCancel={() => setProjectModalOpen(false)} />
      <ConfirmDialog open={confirmDeleteProject} title={`Delete "${project.name}"?`} message="All of its tasks will be removed too. This can't be undone." onConfirm={handleDeleteProject} onCancel={() => setConfirmDeleteProject(false)} />
      <ConfirmDialog open={!!confirmDeleteTask} title="Delete this task?" message="This can't be undone." onConfirm={handleDeleteTask} onCancel={() => setConfirmDeleteTask(null)} />
    </div>
  );
}

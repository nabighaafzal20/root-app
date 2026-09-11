import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Icon from "../../components/Icon";
import Avatar from "../../components/Avatar";
import EmptyState from "../../components/EmptyState";
import ProjectFormModal from "../../components/ProjectFormModal";

export default function ProjectsList() {
  const { projects, tasks, addProject } = useData();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const active = projects.filter((p) => !p.archived);

  function handleSave(data) {
    addProject(data);
    showToast("Project created.");
    setModalOpen(false);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">Break bigger goals into small, doable steps.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Icon name="plus" size={16} /> New project</button>
      </div>

      {active.length === 0 ? (
        <EmptyState icon="layers" title="No projects yet" message="Start one for anything you're working toward." action={<button className="btn btn-primary" onClick={() => setModalOpen(true)}>Create a project</button>} />
      ) : (
        <div className="grid-list grid-cols-2">
          {active.map((p) => {
            const projTasks = tasks.filter((t) => t.projectId === p.id);
            const done = projTasks.filter((t) => t.status === "done").length;
            const pct = projTasks.length ? Math.round((done / projTasks.length) * 100) : 0;
            return (
              <Link to={`/projects/${p.id}`} key={p.id} className="card project-card">
                <div className="project-card-top">
                  <span className="project-color-dot" style={{ background: `var(--${p.color})` }} />
                  <h4>{p.name}</h4>
                </div>
                {p.description && <p className="desc">{p.description}</p>}
                <div className="project-progress-track">
                  <div className="project-progress-fill" style={{ width: `${pct}%`, background: `var(--${p.color})` }} />
                </div>
                <div className="project-card-foot">
                  <span>{done}/{projTasks.length} tasks done</span>
                  {p.collaborators?.length > 0 && (
                    <div className="collab-stack">
                      {p.collaborators.slice(0, 4).map((c) => <Avatar key={c} name={c} size={24} />)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ProjectFormModal open={modalOpen} onSave={handleSave} onCancel={() => setModalOpen(false)} />
    </div>
  );
}

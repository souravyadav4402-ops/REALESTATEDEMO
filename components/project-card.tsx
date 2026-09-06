import Image from "next/image";
import type { Project } from "@/data/projects";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className={`project-card project-card--${project.tone}${project.size === "wide" ? " project-card--wide" : ""}`}>
      <div className="project-card__media">
        <Image src={project.image} alt={project.alt} fill priority={priority} sizes={project.size === "wide" ? "(max-width: 800px) 100vw, 92vw" : "(max-width: 800px) 100vw, 46vw"} />
        <div className="project-card__overlay">
          <span>{project.location}</span><strong>{project.metric}</strong><small>{project.metricLabel}</small>
        </div>
      </div>
      <div className="project-card__body">
        <div><p className="eyebrow">{project.timeline} · {project.assetClass}</p><h2>{project.title}</h2><p>{project.subtitle}</p></div>
        <span className="project-card__index">{String(projectsIndex[project.id] ?? 1).padStart(2, "0")}</span>
      </div>
      <div className="project-card__legal">{project.reraNote}</div>
    </article>
  );
}

const projectsIndex: Record<string, number> = {
  "the-canopy": 1,
  "altamount-sky": 2,
  "casa-isola": 3,
  "alibaug-coastal": 4,
  "one-gurgaon": 5,
  "manyata-exchange": 6,
};

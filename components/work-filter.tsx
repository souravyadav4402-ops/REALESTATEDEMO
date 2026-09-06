"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { projects, type Project } from "@/data/projects";

const filters = ["All", "Goa", "Mumbai", "NCR", "Residential", "Commercial", "Estates"] as const;

export function WorkFilter() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const filtered = useMemo(() => projects.filter((project) => filter === "All" || project.region === filter || project.assetClass === filter), [filter]);

  return (
    <>
      <div className="filter-bar" role="group" aria-label="Filter portfolio">
        <div>{filters.map((item) => <button key={item} type="button" className={filter === item ? "is-active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <span aria-live="polite">{filtered.length.toString().padStart(2, "0")} concepts</span>
      </div>
      <div className="project-grid">{filtered.map((project: Project, index) => <ProjectCard key={project.id} project={project} priority={index < 2} />)}</div>
    </>
  );
}

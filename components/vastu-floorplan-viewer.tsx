"use client";

import { useState } from "react";

export function VastuFloorplanViewer() {
  const [vastu, setVastu] = useState(true);
  const [floor, setFloor] = useState<"Ground" | "First">("Ground");

  return (
    <div className="floorplan-viewer">
      <div className="floorplan-toolbar">
        <div>{(["Ground", "First"] as const).map((item) => <button type="button" key={item} className={floor === item ? "is-active" : ""} aria-pressed={floor === item} onClick={() => setFloor(item)}>{item} floor</button>)}</div>
        <button type="button" className="vastu-switch" aria-pressed={vastu} onClick={() => setVastu((value) => !value)}><i /> Vastu compass</button>
      </div>
      <div className={`floorplan floorplan--${floor.toLowerCase()}${vastu ? " has-vastu" : ""}`}>
        <div className="floorplan__room floorplan__room--living">Living<br/><small>34' × 22'</small></div>
        <div className="floorplan__room floorplan__room--suite">Primary Suite<br/><small>21' × 18'</small></div>
        <div className="floorplan__room floorplan__room--court">Courtyard<br/><small>Open to sky</small></div>
        <div className="floorplan__room floorplan__room--dining">Dining<br/><small>18' × 16'</small></div>
        <div className="vastu-compass" aria-hidden={!vastu}><b>N</b><span>ईशान</span><i /></div>
      </div>
      <p>Interactive demonstration · final plans and Vastu interpretations must be architect-approved.</p>
    </div>
  );
}

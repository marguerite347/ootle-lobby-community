import { useState } from "react";
import { Link } from "react-router-dom";
import { recordCreatorEvent, analyticsEnabled } from "../creatorAnalytics";
export default function LearningProgress({ slug }: { slug: string }) {
  const [stage, setStage] = useState<"ready" | "started" | "complete">("ready");
  function advance() {
    const type = stage === "ready" ? "tutorial_start" : "tutorial_complete";
    void recordCreatorEvent(type, slug);
    setStage(stage === "ready" ? "started" : "complete");
  }
  return (
    <div className="learning-progress panel mt24">
      <div>
        <span className="release-label">YOUR LEARNING JOURNEY</span>
        <h3>
          {stage === "complete"
            ? "Guide completed"
            : stage === "started"
              ? "Add it to your loadout."
              : "Learn the move. Try it yourself."}
        </h3>
        <p className="muted mt8">
          Completion records your reading progress, not a verified
          implementation.{" "}
          {analyticsEnabled()
            ? "Anonymous reporting is enabled."
            : "Anonymous reporting is off."}
        </p>
      </div>
      <button
        className="btn primary"
        onClick={advance}
        disabled={stage === "complete"}
      >
        {stage === "ready"
          ? "Start this guide"
          : stage === "started"
            ? "Mark as completed"
            : "Completed ✓"}
      </button>
      <Link to="/insights">Insights & privacy →</Link>
    </div>
  );
}

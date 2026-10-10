import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getPullDetails } from "../services/githubService";

const REVIEW_LABEL = {
  approved: "Approved",
  changes_requested: "Changes requested",
  none: "No reviews yet",
};

const lineClass = (line) => {
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "del";
  if (line.startsWith("@@")) return "hunk";
  return "";
};

const PullRequestDetailsModal = ({ projectId, pr, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState({});

  useEffect(() => {
    if (!pr) {
      setData(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    setData(null);
    setOpen({});
    getPullDetails(projectId, pr.number)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Could not load this pull request.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, pr]);

  const toggle = (name) => setOpen((o) => ({ ...o, [name]: !o[name] }));

  return (
    <Modal open={!!pr} onClose={onClose} title={pr ? `#${pr.number} ${pr.title}` : "Pull request"} wide>
      {loading && <div className="nf-empty-state">Loading pull request...</div>}
      {error && <div className="nf-form-error">{error}</div>}

      {data && (
        <>
          <div className="nf-pr-summary">
            <span className={`nf-badge nf-pr-review-${data.reviewSummary}`}>
              {REVIEW_LABEL[data.reviewSummary] || data.reviewSummary}
            </span>
            <span className="nf-badge">mergeable: {data.mergeableState}</span>
            <span>{data.changedFiles} files</span>
            <span className="nf-diff-add-count">+{data.additions}</span>
            <span className="nf-diff-del-count">-{data.deletions}</span>
          </div>

          {data.reviews?.length > 0 && (
            <div className="nf-pr-reviews">
              {data.reviews.map((r) => (
                <span key={r.reviewer} className={`nf-badge nf-pr-review-${r.state}`}>
                  @{r.reviewer}: {REVIEW_LABEL[r.state] || r.state}
                </span>
              ))}
            </div>
          )}

          {data.files?.map((f) => (
            <div className="nf-diff-file" key={f.filename}>
              <div className="nf-diff-file-header" onClick={() => toggle(f.filename)}>
                <span className="nf-gh-row-title">{f.filename}</span>
                <span className="nf-badge">{f.status}</span>
                <span className="nf-diff-add-count">+{f.additions}</span>
                <span className="nf-diff-del-count">-{f.deletions}</span>
              </div>

              {open[f.filename] && (
                <div className="nf-diff-body">
                  {f.patch ? (
                    <>
                      {f.patch.split("\n").map((line, i) => (
                        <div key={i} className={`nf-diff-line ${lineClass(line)}`}>{line || " "}</div>
                      ))}
                      {f.truncated && (
                        <div className="nf-empty-state">Diff truncated. Open the pull request on GitHub for the rest.</div>
                      )}
                    </>
                  ) : (
                    <div className="nf-empty-state">No text diff available (binary or very large file).</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {data.filesTruncated && (
            <div className="nf-empty-state">Showing the first {data.files.length} files only.</div>
          )}
        </>
      )}
    </Modal>
  );
};

export default PullRequestDetailsModal;
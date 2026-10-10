import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getCurrentUser } from "../../services/userService";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import {
  connectGithub,
  getGithubStatus,
  disconnectGithub,
} from "../../services/githubService";

const UserProfile = () => {
  const user = getCurrentUser() || {
    name: "—",
    email: "—",
    role: "—",
  };

  const [searchParams] = useSearchParams();

  const [githubStatus, setGithubStatus] = useState({
    connected: false,
    githubUsername: null,
  });

  const [loadingGithub, setLoadingGithub] = useState(true);
  const [githubMessage, setGithubMessage] = useState("");

  useEffect(() => {
    const result = searchParams.get("github");

    if (result === "connected") {
      setGithubMessage("GitHub account connected successfully.");
    }

    if (result === "error") {
      setGithubMessage(
        "Failed to connect GitHub account. Please try again."
      );
    }

    getGithubStatus()
      .then((data) => {
        setGithubStatus(
          data || {
            connected: false,
            githubUsername: null,
          }
        );
      })
      .catch(() => {
        setGithubStatus({
          connected: false,
          githubUsername: null,
        });
      })
      .finally(() => {
        setLoadingGithub(false);
      });
  }, [searchParams]);

  const handleDisconnect = async () => {
    try {
      await disconnectGithub();

      setGithubStatus({
        connected: false,
        githubUsername: null,
      });

      setGithubMessage("GitHub account disconnected successfully.");
    } catch {
      setGithubMessage("Failed to disconnect GitHub account.");
    }
  };

  return (
    <div className="nf-app">
      <Navbar />

      <div className="nf-body">
        <Sidebar />

        <main className="nf-main">
          <h1 className="nf-page-title">My Profile</h1>

          {/* Profile Information */}
          <div className="nf-panel">
            <div className="nf-detail-row">
              Name: <b>{user.name}</b>
            </div>

            <div className="nf-detail-row">
              Email: <b>{user.email}</b>
            </div>

            <div className="nf-detail-row">
              Role: <b>{user.role}</b>
            </div>
          </div>

          {/* GitHub Integration */}
          <div
            className="nf-panel"
            style={{ marginTop: 16 }}
          >
            <h3>GitHub Integration</h3>

            {githubMessage && (
              <div className={githubMessage.includes("Failed") ? "nf-form-error" : "nf-gh-notice"}>
                {githubMessage}
              </div>
            )}

            {loadingGithub ? (
              <p className="nf-detail-row">
                Checking connection status...
              </p>
            ) : githubStatus.connected ? (
              <div className="nf-github-connected">
                <CheckCircle2
                  size={18}
                  color="#34d399"
                />

                <div>
                  <div
                    className="nf-detail-row"
                    style={{
                      margin: 0,
                      fontWeight: 650,
                    }}
                  >
                    Connected as @{githubStatus.githubUsername}
                  </div>

                  <button
                    type="button"
                    className="nf-link-btn danger"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="nf-btn nf-github-connect-btn"
                onClick={connectGithub}
              >
                <span style={{ fontWeight: 700 }}>
                  GitHub
                </span>

                Connect GitHub Account
              </button>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
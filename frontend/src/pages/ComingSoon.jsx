import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const ComingSoon = ({ title }) => (
  <div className="nf-app">
    <Navbar />
    <div className="nf-body">
      <Sidebar />
      <main className="nf-main">
        <h1 className="nf-page-title">{title}</h1>
        <div className="nf-panel">
          <p className="nf-detail-row">
            The <b>{title}</b> module is part of a later milestone and isn't built yet.
            Milestone 1 covers Project &amp; User Management only.
          </p>
        </div>
      </main>
    </div>
    <Footer />
  </div>
);

export default ComingSoon;
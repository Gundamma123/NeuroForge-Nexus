import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getSprintById } from "../../services/sprintService";
import { getTasksBySprint } from "../../services/taskService";

const STATUS_DOT = { "To Do": "#94a3b8", "In Progress": "#60a5fa", "In Review": "#fbbf24", "Done": "#34d399" };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const initials = (name = "") => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const priorityClass = (p) => (p || "").toLowerCase();

const CalendarView = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState("Month");

  useEffect(() => {
    Promise.all([getSprintById(sprintId), getTasksBySprint(sprintId)])
      .then(([sprintData, taskData]) => {
        setSprint(sprintData);
        setTasks((Array.isArray(taskData) ? taskData : []).filter((t) => t.dueDate));
        if (sprintData.startDate) setCursor(new Date(sprintData.startDate));
      })
      .catch(() => setError("Unable to load calendar."))
      .finally(() => setLoading(false));
  }, [sprintId]);

  if (loading) {
    return (<div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
      <main className="nf-main"><div className="nf-loading">Loading calendar...</div></main>
    </div><Footer /></div>);
  }
  if (!sprint) {
    return (<div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
      <main className="nf-main"><div className="nf-form-error">{error || "Sprint not found."}</div></main>
    </div><Footer /></div>);
  }

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const tasksForDate = (date) => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));
  const today = new Date();
  const taskKey = (id) => `NF-${100 + id}`;

  const renderCapsule = (t) => (
    <div key={t.id} className="nf-cal-capsule-rich" onClick={() => navigate(`/tasks/${t.id}`)}>
      <span className="nf-cal-capsule-dot" style={{ background: STATUS_DOT[t.status] || "#94a3b8" }} />
      <span className="nf-cal-capsule-id">{taskKey(t.id)}</span>
      <div className="nf-cal-capsule-body">
        <div className="nf-cal-capsule-rich-title">{t.title}</div>
      </div>
      <span className={`nf-cal-capsule-priority ${priorityClass(t.priority)}`}>{t.priority}</span>
      {t.assignee && <span className="nf-cal-capsule-avatar">{initials(t.assignee.name)}</span>}
    </div>
  );

  // ---------- MONTH VIEW ----------
  const renderMonthView = () => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, outOfMonth: true, date: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, outOfMonth: false, date: new Date(year, month, d) });
    }
    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (startOffset + daysInMonth) + 1;
      cells.push({ day: nextDay, outOfMonth: true, date: new Date(year, month + 1, nextDay) });
    }

    return (
      <div className="nf-cal-grid">
        {WEEKDAYS.map((d) => <div className="nf-cal-weekday" key={d}>{d.toUpperCase()}</div>)}
        {cells.map((cell, i) => {
          const dayTasks = tasksForDate(cell.date);
          const isToday = isSameDay(cell.date, today);
          return (
            <div key={i} className={`nf-cal-cell ${cell.outOfMonth ? "out-of-month" : ""} ${isToday ? "today" : ""}`}>
              <div className="nf-cal-date">{cell.day}</div>
              {dayTasks.map(renderCapsule)}
            </div>
          );
        })}
      </div>
    );
  };

  // ---------- WEEK VIEW ----------
  const renderWeekView = () => {
    const startOfWeek = new Date(cursor);
    startOfWeek.setDate(cursor.getDate() - cursor.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="nf-cal-week-grid">
        {weekDays.map((date, i) => {
          const dayTasks = tasksForDate(date);
          const isToday = isSameDay(date, today);
          return (
            <div key={i} className={`nf-cal-week-col ${isToday ? "today" : ""}`}>
              <div className="nf-cal-week-header">
                <div className="nf-cal-week-dayname">{WEEKDAYS[date.getDay()]}</div>
                <div className="nf-cal-week-daynum">{date.getDate()}</div>
              </div>
              {dayTasks.map(renderCapsule)}
              {dayTasks.length === 0 && (
                <div style={{ fontSize: 11, color: "var(--nf-text-faint)", textAlign: "center", marginTop: 8 }}>
                  No tasks
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const goPrev = () => {
    if (view === "Month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7));
  };
  const goNext = () => {
    if (view === "Month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7));
  };

  const periodLabel =
    view === "Month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : (() => {
          const start = new Date(cursor);
          start.setDate(cursor.getDate() - cursor.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
        })();

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/sprints/${sprintId}`)}>← Back to Sprint Board</span>
          <h1 className="nf-page-title">{sprint.name} — Calendar</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-cal-header">
              <div className="nf-cal-nav">
                <button className="nf-cal-nav-btn" onClick={goPrev}><ChevronLeft size={16} /></button>
                <div className="nf-cal-month-label">{periodLabel}</div>
                <button className="nf-cal-nav-btn" onClick={goNext}><ChevronRight size={16} /></button>
              </div>
              <div className="nf-cal-toggle">
                <button className={view === "Month" ? "active" : ""} onClick={() => setView("Month")}>Month</button>
                <button className={view === "Week" ? "active" : ""} onClick={() => setView("Week")}>Week</button>
              </div>
            </div>

            {view === "Month" ? renderMonthView() : renderWeekView()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CalendarView;
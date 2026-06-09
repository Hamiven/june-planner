import { useState, useEffect } from "react";

function getDayType(date) {
  const d = new Date(2026, 5, date);
  const dow = d.getDay();
  return dow;
}

function isWorkDay(date) {
  const dow = getDayType(date);
  if (dow === 1 || dow === 3 || dow === 5) return true;
  if (dow === 2) {
    const tuesdayNum = Math.ceil(date / 7);
    if (tuesdayNum === 1 || tuesdayNum === 3) return true;
  }
  return false;
}

function isGymDay(date) {
  const dow = getDayType(date);
  return [1, 2, 4, 6].includes(dow);
}

function getContentTasks(date) {
  const tasks = [];
  tasks.push({ id: `story-${date}`, label: "📱 Сторис (снять + опубликовать)", type: "content" });
  if ((date - 1) % 3 === 0) {
    tasks.push({ id: `post-${date}`, label: "🖼 Пост (создать + опубликовать)", type: "content" });
  }
  return tasks;
}

function getDayTasks(date) {
  const dow = getDayType(date);
  const tasks = [];
  if (isWorkDay(date)) tasks.push({ id: `work-${date}`, label: "💼 Работа", type: "work" });
  if (isGymDay(date)) tasks.push({ id: `gym-${date}`, label: "🏋️ Зал", type: "gym" });
  for (let m = 1; m <= 4; m++) {
    tasks.push({ id: `meal-${date}-${m}`, label: `🍽 Приём пищи ${m}`, type: "meal" });
  }
  tasks.push(...getContentTasks(date));
  tasks.push({ id: `shopify-${date}`, label: "🛒 Shopify: проверить магазин", type: "shopify" });
  return tasks;
}

const TYPE_COLORS = {
  work:    { bg: "#EEF2FF", border: "#818CF8", text: "#4338CA", dot: "#6366F1" },
  gym:     { bg: "#F0FDF4", border: "#4ADE80", text: "#15803D", dot: "#22C55E" },
  meal:    { bg: "#FFF7ED", border: "#FB923C", text: "#C2410C", dot: "#F97316" },
  content: { bg: "#FDF4FF", border: "#C084FC", text: "#7E22CE", dot: "#A855F7" },
  shopify: { bg: "#F0FDFA", border: "#2DD4BF", text: "#0F766E", dot: "#14B8A6" },
};

const DAY_NAMES_FULL = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const MONTH_DAYS = 30;

export default function App() {
  const [checked, setChecked] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState("month");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("june-planner-2026");
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("june-planner-2026", JSON.stringify(checked));
    } catch {}
  }, [checked]);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const getDayProgress = (date) => {
    const tasks = getDayTasks(date);
    const done = tasks.filter(t => checked[t.id]).length;
    return { done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
  };

  const totalTasks = Array.from({length: MONTH_DAYS}, (_, i) => getDayTasks(i+1)).flat().length;
  const totalDone = Object.values(checked).filter(Boolean).length;
  const monthPct = Math.round((totalDone / totalTasks) * 100);
  const storiesDone = Array.from({length: MONTH_DAYS}, (_, i) => checked[`story-${i+1}`]).filter(Boolean).length;
  const postsDone = Array.from({length: MONTH_DAYS}, (_, i) => checked[`post-${i+1}`]).filter(Boolean).length;

  const today = new Date();
  const isJune2026 = today.getFullYear() === 2026 && today.getMonth() === 5;
  const todayDate = isJune2026 ? today.getDate() : null;
  const firstDow = new Date(2026, 5, 1).getDay();
  const calendarOffset = firstDow === 0 ? 6 : firstDow - 1;

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F13", color: "#E8E8F0", fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: "#6366F1", textTransform: "uppercase", marginBottom: 4 }}>Планер</div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Июнь 2026</h1>
          </div>
          {view === "day" && (
            <button onClick={() => { setView("month"); setSelectedDay(null); }} style={{ background: "#1E1E2A", border: "1px solid #2E2E40", color: "#A0A0C0", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              ← Назад
            </button>
          )}
        </div>

        <div style={{ background: "#1A1A26", borderRadius: 16, padding: "16px 20px", marginBottom: 20, border: "1px solid #2E2E40" }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <Stat label="Месяц" value={`${monthPct}%`} color="#6366F1" />
            <Stat label="Сторис" value={`${storiesDone}/30`} color="#A855F7" />
            <Stat label="Посты" value={`${postsDone}/10`} color="#A855F7" />
            <Stat label="Задач" value={`${totalDone}/${totalTasks}`} color="#6B7280" />
          </div>
          <div style={{ background: "#0F0F18", borderRadius: 99, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${monthPct}%`, height: "100%", background: "linear-gradient(90deg, #6366F1, #A855F7)", borderRadius: 99, transition: "width 0.4s" }} />
          </div>
        </div>

        {view === "month" ? (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {Object.entries(TYPE_COLORS).map(([type, c]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#A0A0C0" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot }} />
                  {type === "work" ? "Работа" : type === "gym" ? "Зал" : type === "meal" ? "Питание" : type === "content" ? "Контент" : "Shopify"}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#4A4A6A", padding: "4px 0", letterSpacing: 1 }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: calendarOffset }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: MONTH_DAYS }, (_, i) => i + 1).map(date => {
                const { pct } = getDayProgress(date);
                const tasks = getDayTasks(date);
                const isToday = todayDate === date;
                const types = [...new Set(tasks.map(t => t.type))];
                return (
                  <button key={date} onClick={() => { setSelectedDay(date); setView("day"); }} style={{ background: isToday ? "#1E1E3A" : "#1A1A26", border: isToday ? "1.5px solid #6366F1" : "1px solid #2E2E40", borderRadius: 12, padding: "10px 8px", cursor: "pointer", textAlign: "left", minHeight: 70, position: "relative" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? "#818CF8" : "#D0D0E8", marginBottom: 6 }}>{date}</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 6 }}>
                      {types.map(type => <div key={type} style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[type]?.dot || "#666" }} />)}
                    </div>
                    <div style={{ background: "#0F0F18", borderRadius: 99, height: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#22C55E" : "linear-gradient(90deg, #6366F1, #A855F7)", borderRadius: 99 }} />
                    </div>
                    {pct === 100 && <div style={{ position: "absolute", top: 6, right: 6, fontSize: 10 }}>✅</div>}
                  </button>
                );
              })}
            </div>
          </>
        ) : selectedDay ? (
          <DayView date={selectedDay} checked={checked} toggle={toggle} />
        ) : null}
      </div>
    </div>
  );
}

function DayView({ date, checked, toggle }) {
  const dow = getDayType(date);
  const tasks = getDayTasks(date);
  const done = tasks.filter(t => checked[t.id]).length;
  const pct = Math.round((done / tasks.length) * 100);
  const grouped = {};
  tasks.forEach(t => { if (!grouped[t.type]) grouped[t.type] = []; grouped[t.type].push(t); });
  const typeOrder = ["work", "gym", "meal", "content", "shopify"];
  const typeLabels = { work: "💼 Работа", gym: "🏋️ Зал", meal: "🍽 Питание", content: "📸 Контент", shopify: "🛒 Shopify" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>{DAY_NAMES_FULL[dow]}</div>
        <h2 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 800, color: "#fff" }}>{date} июня</h2>
        <div style={{ background: "#1A1A26", borderRadius: 12, padding: "12px 16px", border: "1px solid #2E2E40", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, background: "#0F0F18", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#22C55E" : "linear-gradient(90deg, #6366F1, #A855F7)", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: pct === 100 ? "#22C55E" : "#818CF8", minWidth: 50, textAlign: "right" }}>{pct}%</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {typeOrder.filter(t => grouped[t]).map(type => {
          const c = TYPE_COLORS[type];
          return (
            <div key={type} style={{ background: "#1A1A26", borderRadius: 14, border: "1px solid #2E2E40", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #2E2E40", fontSize: 12, fontWeight: 700, color: c.dot }}>{typeLabels[type]}</div>
              <div style={{ padding: "8px 0" }}>
                {grouped[type].map(task => {
                  const isChecked = !!checked[task.id];
                  return (
                    <label key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer" }}>
                      <div onClick={() => toggle(task.id)} style={{ width: 22, height: 22, borderRadius: 7, border: isChecked ? "none" : "2px solid #3E3E56", background: isChecked ? c.dot : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", cursor: "pointer" }}>
                        {isChecked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span onClick={() => toggle(task.id)} style={{ fontSize: 14, color: isChecked ? "#4A4A6A" : "#C0C0D8", textDecoration: isChecked ? "line-through" : "none", transition: "all 0.2s", flex: 1 }}>
                        {task.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#4A4A6A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

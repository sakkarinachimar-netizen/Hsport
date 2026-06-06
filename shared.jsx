/* shared.jsx — Logo, Topbar, common UI for PDSHS e-Portfolio */

/* ---------- Brand mark: official wide logo (โรงเรียนสาธิต มศว ปทุมวัน) ----------
   โลโก้แนวยาว มี mark + ตราโรงเรียน + ชื่ออยู่ในรูปแล้ว
   ล็อกความสูง ปล่อยความกว้าง auto เพื่อคงสัดส่วน */
function BrandMark({ size = 40 }) {
  return (
    <img
      src="uploads/logo-sm.png"
      alt="โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน — แฟ้มสะสมผลงาน วิชาเอกวิทยาศาสตร์สุขภาพ"
      style={{ height: size, width: "auto", display: "inline-block", verticalAlign: "middle" }}
    />
  );
}

function Brand() {
  // โลโก้มีชื่อโรงเรียนในรูปแล้ว จึงไม่ใส่ตัวหนังสือซ้ำ
  return (
    <div className="brand">
      <BrandMark size={48} />
    </div>
  );
}

/* ---------- Topbar / nav ---------- */
function Topbar({ role, current, onNavigate, onLogout, items, user }) {
  const rolePill =
    role === "teacher" ? <span className="role-pill teacher">● อาจารย์ผู้ประเมิน</span>
    : role === "admin" ? <span className="role-pill admin">● ผู้ดูแลระบบ</span>
    : <span className="role-pill">● นักเรียน</span>;
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <nav className="nav">
          {items.map((it) => (
            <button
              key={it.key}
              className={current === it.key ? "active" : ""}
              onClick={() => onNavigate(it.key)}
            >
              {it.label}
            </button>
          ))}
          <span className="divider"></span>
          {rolePill}
          <button className="icon-btn" title="ออกจากระบบ" onClick={onLogout} aria-label="logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Small UI helpers ---------- */
function Pill({ kind = "gray", children }) {
  return <span className={`pill pill-${kind}`}>{children}</span>;
}

function Avatar({ emoji = "👩‍🎓", size = 48, gradient }) {
  const style = {
    width: size, height: size, borderRadius: "50%",
    background: gradient || "linear-gradient(135deg,#ff79c6,#a06bff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.5, flexShrink: 0,
  };
  return <div style={style}>{emoji}</div>;
}

function ProgressBar({ value, max = 5, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bar"><span style={{ width: pct + "%", background: color }}></span></div>
  );
}

/* ---------- Radar chart (8 axes) ---------- */
function RadarChart({ labels, values, max = 5, size = 360 }) {
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.36;
  const n = labels.length;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i, v) => {
    const r = radius * (v / max);
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };
  const grid = [1, 2, 3, 4, 5].map((g) => {
    const pts = labels.map((_, i) => point(i, g).join(",")).join(" ");
    return <polygon key={g} points={pts} fill="none" stroke="#e5e9f0" />;
  });
  const axes = labels.map((_, i) => {
    const [x, y] = point(i, max);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#eef2f7" />;
  });
  const dataPts = values.map((v, i) => point(i, v).join(",")).join(" ");
  const dots = values.map((v, i) => {
    const [x, y] = point(i, v);
    return <circle key={i} cx={x} cy={y} r="3.5" fill="#2f6bff" />;
  });
  const labelEls = labels.map((l, i) => {
    const [x, y] = point(i, max + 0.6);
    const anchor = Math.abs(x - cx) < 4 ? "middle" : (x > cx ? "start" : "end");
    return <text key={i} x={x} y={y} textAnchor={anchor} dy="0.32em" fontSize="11.5" fill="#334155">{l}</text>;
  });
  const ringLabels = [1, 2, 3, 4, 5].map((g) => (
    <text key={g} x={cx + 4} y={cy - radius * (g/max) + 4} fontSize="10" fill="#94a3b8">{g}</text>
  ));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {grid}{axes}
      <polygon points={dataPts} fill="rgba(47,107,255,.18)" stroke="#2f6bff" strokeWidth="1.5" />
      {dots}{ringLabels}{labelEls}
    </svg>
  );
}

/* ---------- Toast ---------- */
function useToast() {
  const [msg, setMsg] = React.useState(null);
  const show = (m) => {
    setMsg(m);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setMsg(null), 2400);
  };
  const node = msg ? <div className="toast">{msg}</div> : null;
  return [show, node];
}

/* ---------- Modal ---------- */
function Modal({ title, children, onClose, footer, width }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" style={width ? { width } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="ปิด">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Inline icons (sparingly used) ---------- */
const Icons = {
  calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  users: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  doc: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

/* ---------- Change password (logged-in, no email needed) ---------- */
function ChangePasswordCard({ toast }) {
  if (!(window.PfAuth && window.PfAuth.available && window.PfAuth.available())) return null;
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (pw.length < 6) { setMsg("รหัสผ่านอย่างน้อย 6 ตัวอักษร"); return; }
    if (pw !== pw2) { setMsg("รหัสผ่านทั้งสองช่องไม่ตรงกัน"); return; }
    setBusy(true);
    try {
      await window.PfAuth.updatePassword(pw);
      setPw(""); setPw2(""); setMsg("✓ เปลี่ยนรหัสผ่านเรียบร้อย");
      if (toast) toast("เปลี่ยนรหัสผ่านเรียบร้อย");
    } catch (e2) {
      setMsg("ไม่สำเร็จ: " + (e2 && e2.message ? e2.message : e2));
    } finally { setBusy(false); }
  };

  return (
    <div className="card mt-4">
      <h3>🔑 เปลี่ยนรหัสผ่าน</h3>
      <form onSubmit={submit}>
        <div className="field" style={{textAlign:"left"}}>
          <label>รหัสผ่านใหม่</label>
          <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร"/>
        </div>
        <div className="field" style={{textAlign:"left"}}>
          <label>ยืนยันรหัสผ่านใหม่</label>
          <input className="input" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="กรอกซ้ำอีกครั้ง"/>
        </div>
        {msg && <div style={{margin:"2px 0 10px",fontSize:13,color: msg.startsWith("✓")?"#059669":"#dc2626"}}>{msg}</div>}
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}
        </button>
      </form>
    </div>
  );
}

/* ---------- Export to window ---------- */
Object.assign(window, {
  BrandMark, Brand, Topbar, Pill, Avatar, ProgressBar, RadarChart,
  useToast, Modal, Icons, ChangePasswordCard,
});

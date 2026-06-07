/* admin.jsx — Administrator role pages */

const ADMIN_NAV = [
  { key: "a-home",      label: "แดชบอร์ดระบบ" },
  { key: "a-users",     label: "จัดการผู้ใช้" },
  { key: "a-activities",label: "จัดการกิจกรรม" },
  { key: "a-internship", label: "จัดการฝึกงาน" },
  { key: "a-rubrics",   label: "จัดการรูบริก" },
  { key: "a-reports",   label: "รายงาน" },
  { key: "a-settings",  label: "ตั้งค่าระบบ" },
];

const ADMIN_SELF = {};
const ALL_USERS = [];
const ADMIN_ACTIVITIES = [];
/* ---------- Admin Home ---------- */
function AdminHome({ go }) {
  const u = window.pfCurrentUser || {};
  const [counts, setCounts] = React.useState({ student: null, teacher: null, admin: null });
  React.useEffect(() => {
    if (!window.PfUsers || !window.PF_SUPABASE_READY) return;
    (async () => {
      try {
        const all = await window.PfUsers.list();
        const c = { student: 0, teacher: 0, admin: 0 };
        (all || []).forEach(x => { if (c[x.role] !== undefined) c[x.role]++; });
        setCounts(c);
      } catch (e) { /* leave as null */ }
    })();
  }, []);
  const total = (counts.student || 0) + (counts.teacher || 0) + (counts.admin || 0);

  return (
    <div className="page">
      <div className="hero">
        <Avatar emoji="🛡️" size={64} gradient="linear-gradient(135deg,#fda4af,#fb7185)"/>
        <div>
          <h1>สวัสดี {u.name || "ผู้ดูแลระบบ"}</h1>
          <p>ผู้ดูแลระบบ • PDS_HS Portfolio System</p>
          <a>ภาพรวมการใช้งานระบบและสิทธิ์ผู้ใช้</a>
        </div>
      </div>

      <div className="stat-grid mt-5" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <div className="stat stat-blue"><div className="num">{counts.student ?? "—"}</div><div className="lbl">นักเรียน</div></div>
        <div className="stat stat-purple"><div className="num">{counts.teacher ?? "—"}</div><div className="lbl">อาจารย์ผู้ประเมิน</div></div>
        <div className="stat stat-green"><div className="num">{counts.admin ?? "—"}</div><div className="lbl">ผู้ดูแลระบบ</div></div>
        <div className="stat stat-amber"><div className="num">{total || "—"}</div><div className="lbl">ผู้ใช้ทั้งหมด</div></div>
      </div>

      <div className="card mt-5">
        <div className="row-between">
          <h2 className="mb-0">เริ่มต้นใช้งานระบบ</h2>
          <button className="btn btn-primary btn-sm" onClick={()=>go("a-users")}>จัดการผู้ใช้ →</button>
        </div>
        <div className="muted mt-3" style={{lineHeight:1.7}}>
          ระบบยังว่าง — เริ่มจาก: <b>(1)</b> เพิ่มผู้ใช้ (นักเรียน/อาจารย์) ผ่านเมนู "จัดการผู้ใช้" หรือ "นำเข้า CSV"
          → <b>(2)</b> นักเรียนล็อกอินเข้ามาอัปโหลดหลักฐาน → <b>(3)</b> อาจารย์ตรวจประเมิน
        </div>
      </div>
    </div>
  );
}

/* ---- mini Bar chart ---- */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v));
  const w = 520, h = 200, pad = 24, bw = (w - pad*2) / data.length - 8;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%", height:"auto"}}>
      {[0.25,0.5,0.75,1].map((g,i)=>(
        <line key={i} x1={pad} x2={w-pad} y1={h-pad - (h-pad*2)*g} y2={h-pad - (h-pad*2)*g} stroke="#eef2f7"/>
      ))}
      {data.map((d, i) => {
        const x = pad + i * ((w - pad*2) / data.length) + 4;
        const bh = (h - pad*2) * (d.v / max);
        return (
          <g key={i}>
            <rect x={x} y={h - pad - bh} width={bw} height={bh} rx="6" fill="url(#bg)"/>
            <text x={x + bw/2} y={h-6} textAnchor="middle" fontSize="11" fill="#64748b">{d.l}</text>
            <text x={x + bw/2} y={h - pad - bh - 4} textAnchor="middle" fontSize="11" fill="#334155">{d.v}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#14b8a6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---- Donut chart ---- */
function Donut({ slices }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 64, R = 90, cx = 100, cy = 100;
  let acc = 0;
  const arcs = slices.map((s, i) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + R*Math.cos(a0), y0 = cy + R*Math.sin(a0);
    const x1 = cx + R*Math.cos(a1), y1 = cy + R*Math.sin(a1);
    const x0i = cx + r*Math.cos(a1), y0i = cy + r*Math.sin(a1);
    const x1i = cx + r*Math.cos(a0), y1i = cy + r*Math.sin(a0);
    const d = `M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1} L${x0i} ${y0i} A${r} ${r} 0 ${large} 0 ${x1i} ${y1i} Z`;
    return <path key={i} d={d} fill={s.color} />;
  });
  return (
    <div className="row gap-4" style={{alignItems:"center"}}>
      <svg viewBox="0 0 200 200" width="200" height="200">
        {arcs}
        <text x="100" y="98" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">{total}</text>
        <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#64748b">ผู้ใช้ทั้งหมด</text>
      </svg>
      <div style={{flex:1}}>
        {slices.map((s,i) => (
          <div key={i} className="row-between" style={{padding:"6px 0"}}>
            <div className="row gap-2"><span className="dot" style={{background:s.color}}></span>{s.label}</div>
            <div className="mono">{s.value} <span className="muted small">({Math.round(s.value/total*100)}%)</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Users ---------- */
const ROLE_LABELS = { student:"นักเรียน", teacher:"อาจารย์", admin:"ผู้ดูแลระบบ" };
const ROLE_FROM_TH = { "นักเรียน":"student", "อาจารย์":"teacher", "ผู้ดูแลระบบ":"admin" };

// แปลงค่า role จาก CSV (รับทั้งไทย/อังกฤษ) → key มาตรฐาน
function normalizeRole(v) {
  const s = (v || "").trim().toLowerCase();
  if (["teacher","อาจารย์","อาจารย์ที่ปรึกษา","ครู"].includes(s) || s === "teacher") return "teacher";
  if (["admin","ผู้ดูแลระบบ","แอดมิน"].includes(s)) return "admin";
  return "student";
}

// CSV template สำหรับนำเข้าผู้ใช้
const USER_CSV_TEMPLATE =
  "email,password,name,role,student_code,grade\n" +
  "student1@pdshs.ac.th,Pdshs12345,สมหญิง เรียนดี,student,65001250,ม.5/2\n" +
  "teacher1@pdshs.ac.th,Pdshs12345,อ. สมชาย ใจดี,teacher,,\n";

// parser รองรับ field ที่มีเครื่องหมายคำพูด/คอมมา
function parseCSV(text) {
  const out = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.trim().length);
  for (const line of lines) {
    const cells = []; let cur = ""; let inq = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inq) {
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inq = false; }
        else cur += c;
      } else {
        if (c === '"') inq = true;
        else if (c === ",") { cells.push(cur); cur = ""; }
        else cur += c;
      }
    }
    cells.push(cur);
    out.push(cells.map(s => s.trim()));
  }
  return out;
}

function AdminUsers({ toast }) {
  const backend = !!(window.PfUsers && window.PF_SUPABASE_READY);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(backend);
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [openNew, setOpenNew] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef(null);
  const [form, setForm] = React.useState({ email:"", password:"", name:"", role:"student", studentCode:"", grade:"" });
  const [openEdit, setOpenEdit] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ name:"", code:"", grade:"" });
  const [confirmDel, setConfirmDel] = React.useState(null);

  // normalize → { id, code, name, email, role(key), grade }
  const norm = React.useCallback((rows, isDb) => rows.map(u => isDb
    ? { id:u.id, code:u.student_code||"", name:u.name, email:u.email, role:u.role, grade:u.grade||"" }
    : { id:u.id, code:u.id, name:u.name, email:"—", role:ROLE_FROM_TH[u.role]||"student", grade:u.room||"" }
  ), []);

  const load = React.useCallback(async () => {
    if (!backend) { setUsers(norm(ALL_USERS, false)); setLoading(false); return; }
    setLoading(true);
    try {
      const rows = await window.PfUsers.list();
      setUsers(norm(rows || [], true));
    } catch (e) { toast("โหลดรายชื่อผู้ใช้ไม่สำเร็จ: " + (e.message||e)); }
    finally { setLoading(false); }
  }, [backend, norm, toast]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    (role === "all" || u.role === role) &&
    (!q || (u.name||"").includes(q) || (u.code||"").toLowerCase().includes(q.toLowerCase())
        || (u.email||"").toLowerCase().includes(q.toLowerCase()))
  );

  const changeRole = async (id, newRole) => {
    if (!backend) { toast("เปลี่ยนบทบาทได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    const prev = users;
    setUsers(us => us.map(x => x.id === id ? { ...x, role:newRole } : x));
    try { await window.PfUsers.updateRole(id, newRole); toast("เปลี่ยนบทบาทเป็น "+ROLE_LABELS[newRole]+" แล้ว"); }
    catch (e) { setUsers(prev); toast("เปลี่ยนบทบาทไม่สำเร็จ: " + (e.message||e)); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!backend) { toast("สร้างผู้ใช้ได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    if (!form.email || !form.password || !form.name) { toast("กรอกอีเมล รหัสผ่าน และชื่อให้ครบ"); return; }
    if (form.password.length < 6) { toast("รหัสผ่านอย่างน้อย 6 ตัวอักษร"); return; }
    setBusy(true);
    try {
      await window.PfUsers.createUser({
        email:form.email.trim(), password:form.password, name:form.name,
        role:form.role, studentCode:form.studentCode, grade:form.grade,
      });
      setOpenNew(false);
      setForm({ email:"", password:"", name:"", role:"student", studentCode:"", grade:"" });
      toast("สร้างบัญชีผู้ใช้เรียบร้อย");
      await load();
    } catch (e2) {
      toast(e2?.message?.includes("registered") ? "อีเมลนี้ถูกใช้แล้ว" : ("สร้างไม่สำเร็จ: " + (e2.message||e2)));
    } finally { setBusy(false); }
  };

  const startEdit = (u) => {
    setEditForm({ name: u.name || "", code: u.code || "", grade: u.grade || "" });
    setOpenEdit(u);
  };
  const saveEdit = async () => {
    if (!backend) { toast("แก้ไขได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    if (!editForm.name.trim()) { toast("ชื่อห้ามว่าง"); return; }
    setBusy(true);
    try {
      await window.PfUsers.update(openEdit.id, {
        name: editForm.name.trim(),
        student_code: editForm.code.trim() || null,
        grade: editForm.grade.trim() || null,
      });
      setOpenEdit(null);
      toast("บันทึกข้อมูลผู้ใช้เรียบร้อย");
      await load();
    } catch (e) { toast("แก้ไขไม่สำเร็จ: " + (e.message || e)); }
    finally { setBusy(false); }
  };
  const doDelete = async () => {
    if (!backend) { toast("ลบได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    setBusy(true);
    try {
      await window.PfUsers.remove(confirmDel.id);
      const removedName = confirmDel.name;
      setConfirmDel(null);
      toast(`ลบ "${removedName}" ออกจากระบบแล้ว`);
      await load();
    } catch (e) { toast("ลบไม่สำเร็จ: " + (e.message || e)); }
    finally { setBusy(false); }
  };

  const downloadTemplate = () => {
    // ﻿ (BOM) ให้ Excel เปิดภาษาไทยถูกต้อง
    const blob = new Blob(["﻿" + USER_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pdshs-users-template.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // reset ให้เลือกไฟล์เดิมซ้ำได้
    if (!file) return;
    if (!backend) { toast("นำเข้าได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) { toast("ไฟล์ว่างหรือไม่มีข้อมูล"); return; }
    const header = rows[0].map(h => h.toLowerCase());
    const ci = (name) => header.indexOf(name);
    const iEmail = ci("email"), iPass = ci("password"), iName = ci("name"),
          iRole = ci("role"), iCode = ci("student_code"), iGrade = ci("grade");
    if (iEmail < 0 || iName < 0) { toast("หัวคอลัมน์ต้องมีอย่างน้อย email และ name"); return; }

    setImporting(true);
    let ok = 0, fail = 0; const errs = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const email = (row[iEmail] || "").trim();
      const name = (row[iName] || "").trim();
      if (!email || !name) { continue; }
      const password = (iPass >= 0 && row[iPass]) ? row[iPass].trim() : "Pdshs12345";
      try {
        await window.PfUsers.createUser({
          email, password, name,
          role: normalizeRole(iRole >= 0 ? row[iRole] : "student"),
          studentCode: iCode >= 0 ? row[iCode] : "",
          grade: iGrade >= 0 ? row[iGrade] : "",
        });
        ok++;
      } catch (err) {
        fail++;
        if (errs.length < 5) errs.push(`${email}: ${err.message || err}`);
      }
    }
    setImporting(false);
    await load();
    toast(`นำเข้าเสร็จ: สำเร็จ ${ok} • ล้มเหลว ${fail}${errs.length ? " — " + errs.join("; ") : ""}`);
  };

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>จัดการผู้ใช้</h2>
          <div className="muted small">
            {backend ? `เพิ่มผู้ใช้และกำหนดบทบาท นักเรียน/อาจารย์/ผู้ดูแลระบบ (${users.length} บัญชี)`
                     : "โหมดสาธิต — เชื่อมฐานข้อมูลเพื่อจัดการผู้ใช้จริง"}
          </div>
        </div>
        <div className="filterbar">
          <input className="input" placeholder="ค้นหาด้วยชื่อ/อีเมล/รหัส" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="select" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="all">ทุกบทบาท</option>
            <option value="student">นักเรียน</option><option value="teacher">อาจารย์</option><option value="admin">ผู้ดูแลระบบ</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={downloadTemplate} title="ดาวน์โหลดไฟล์ตัวอย่าง CSV">⬇ Template</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current && fileRef.current.click()} disabled={!backend || importing}>
            {importing ? "กำลังนำเข้า…" : "⬆ นำเข้า CSV"}
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{display:"none"}} onChange={handleImport}/>
          <button className="btn btn-primary btn-sm" onClick={()=>setOpenNew(true)}><Icons.plus/> เพิ่มผู้ใช้</button>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>อีเมล</th><th>ชั้น/สังกัด</th><th>บทบาท</th><th className="text-right">การจัดการ</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="muted" style={{padding:20,textAlign:"center"}}>กำลังโหลด…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{padding:20,textAlign:"center"}}>ไม่พบผู้ใช้</td></tr>
            ) : filtered.map(u => {
              const isMe = window.pfCurrentUser && u.id === window.pfCurrentUser.id;
              return (
              <tr key={u.id}>
                <td className="mono">{u.code || "—"}</td>
                <td><b>{u.name}</b></td>
                <td className="muted">{u.email}</td>
                <td>{u.grade || "—"}</td>
                <td>
                  <select className="select" value={u.role} disabled={!backend || isMe}
                    title={isMe ? "เปลี่ยน role ของตัวเองไม่ได้" : ""}
                    onChange={e=>changeRole(u.id, e.target.value)} style={{minWidth:130}}>
                    <option value="student">นักเรียน</option>
                    <option value="teacher">อาจารย์</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </td>
                <td className="text-right">
                  <div className="row gap-2" style={{justifyContent:"flex-end"}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(u)} disabled={!backend}>แก้ไข</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setConfirmDel(u)}
                      disabled={!backend || isMe} title={isMe ? "ลบตัวเองไม่ได้" : ""}
                      style={{color: isMe ? undefined : "#dc2626"}}>ลบ</button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      {openNew && (
        <Modal title="เพิ่มผู้ใช้ใหม่" onClose={()=>setOpenNew(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setOpenNew(false)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={create} disabled={busy}>{busy?"กำลังสร้าง…":"สร้างบัญชี"}</button>
          </>}>
          <div className="field"><label>อีเมล (ใช้ล็อกอิน)</label>
            <input className="input" type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} placeholder="student@pdshs.ac.th"/></div>
          <div className="field"><label>รหัสผ่านเริ่มต้น</label>
            <input className="input" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} placeholder="อย่างน้อย 6 ตัวอักษร"/></div>
          <div className="field"><label>ชื่อ-นามสกุล</label>
            <input className="input" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/></div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}><label>บทบาท</label>
              <select className="select" value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
                <option value="student">นักเรียน</option><option value="teacher">อาจารย์</option><option value="admin">ผู้ดูแลระบบ</option>
              </select></div>
            <div className="field" style={{flex:1}}><label>{form.role==="student"?"ชั้น":"สังกัด"}</label>
              <input className="input" value={form.grade} onChange={e=>setForm(f=>({...f, grade:e.target.value}))} placeholder={form.role==="student"?"เช่น ม.5/2":"—"}/></div>
          </div>
          {form.role==="student" && (
            <div className="field"><label>รหัสนักเรียน</label>
              <input className="input mono" value={form.studentCode} onChange={e=>setForm(f=>({...f, studentCode:e.target.value}))} placeholder="เช่น 65001234"/></div>
          )}
          <div className="muted small">ผู้ใช้จะล็อกอินด้วยอีเมล+รหัสผ่านนี้ทันที (ปิดยืนยันอีเมลแล้ว)</div>
        </Modal>
      )}

      {openEdit && (
        <Modal title={`แก้ไขข้อมูล: ${openEdit.email}`} onClose={()=>setOpenEdit(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setOpenEdit(null)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>{busy?"กำลังบันทึก…":"บันทึก"}</button>
          </>}>
          <div className="field"><label>ชื่อ-นามสกุล</label>
            <input className="input" value={editForm.name} onChange={e=>setEditForm(f=>({...f, name:e.target.value}))}/></div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}><label>รหัสนักเรียน</label>
              <input className="input mono" value={editForm.code} onChange={e=>setEditForm(f=>({...f, code:e.target.value}))} placeholder="เช่น 65001234"/></div>
            <div className="field" style={{flex:1}}><label>ชั้น/สังกัด</label>
              <input className="input" value={editForm.grade} onChange={e=>setEditForm(f=>({...f, grade:e.target.value}))} placeholder="เช่น ม.5/2"/></div>
          </div>
          <div className="muted small">เปลี่ยน <b>บทบาท</b> ทำได้ตรงๆ จาก dropdown ในตาราง — เปลี่ยน <b>อีเมล/รหัสผ่าน</b> ต้องทำใน Supabase Dashboard</div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="ยืนยันการลบผู้ใช้" onClose={()=>setConfirmDel(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setConfirmDel(null)}>ยกเลิก</button>
            <button className="btn btn-danger" onClick={doDelete} disabled={busy}>{busy?"กำลังลบ…":"ลบผู้ใช้"}</button>
          </>}>
          <div>ลบ <b>{confirmDel.name}</b> ({confirmDel.email}) ออกจากระบบ?</div>
          <div className="muted small mt-3" style={{lineHeight:1.7}}>
            • ผู้ใช้จะเข้าระบบไม่ได้อีก<br/>
            • <b>หลักฐาน/การประเมิน</b>ที่ผู้ใช้สร้างไว้จะถูกลบตาม (CASCADE)<br/>
            • หากต้องการลบ auth account ด้วย (รีเซ็ตอีเมลเพื่อเอากลับมาใช้ใหม่ได้) ต้องลบใน Supabase Dashboard → Authentication → Users
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Activities mgmt ---------- */
function AdminActivities({ toast }) {
  const backend = !!(window.PfActivities && window.PF_SUPABASE_READY);
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(backend);
  const [open, setOpen] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const blank = { title:"", description:"", date:"", timeStart:"", timeEnd:"", location:"", category:"camp", cap:"", status:"open" };

  const load = React.useCallback(async () => {
    if (!backend) { setLoading(false); return; }
    setLoading(true);
    try { setList(await window.PfActivities.list()); }
    catch (e) { toast("โหลดกิจกรรมไม่สำเร็จ: " + (e.message||e)); }
    finally { setLoading(false); }
  }, [backend, toast]);
  React.useEffect(() => { load(); }, [load]);

  const openNew = () => setOpen({ ...blank });
  const openEdit = (a) => setOpen({
    id: a.id, title: a.title || "", description: a.description || "",
    date: a.date || "", timeStart: a.time_start || "", timeEnd: a.time_end || "",
    location: a.location || "", category: a.category || "other",
    cap: a.cap != null ? String(a.cap) : "", status: a.status || "open",
  });

  const save = async () => {
    if (!open.title.trim() || !open.date) { toast("กรอกชื่อ + วันที่"); return; }
    setBusy(true);
    try {
      await window.PfActivities.save(open);
      toast("บันทึกกิจกรรมเรียบร้อย");
      setOpen(null); await load();
    } catch (e) { toast("บันทึกไม่สำเร็จ: " + (e.message||e)); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`ลบกิจกรรม "${open.title}" ?`)) return;
    setBusy(true);
    try {
      await window.PfActivities.remove(open.id);
      toast("ลบเรียบร้อย");
      setOpen(null); await load();
    } catch (e) { toast("ลบไม่สำเร็จ: " + (e.message||e)); }
    finally { setBusy(false); }
  };

  const cats = window.ACTIVITY_CATEGORIES || [];
  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>จัดการกิจกรรม</h2>
          <div className="muted small">เพิ่ม/แก้ไขกิจกรรมและโครงการที่นักเรียนจะลงทะเบียน</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Icons.plus/> สร้างกิจกรรม</button>
      </div>
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>ชื่อกิจกรรม</th><th>ประเภท</th><th>วันที่</th><th>เวลา</th><th>สถานที่</th><th>ลงทะเบียน</th><th>สถานะ</th><th className="text-right">การจัดการ</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="muted" style={{padding:20,textAlign:"center"}}>กำลังโหลด…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={8} className="muted" style={{padding:30,textAlign:"center"}}>ยังไม่มีกิจกรรม — กด "+ สร้างกิจกรรม"</td></tr>
            ) : list.map(a => {
              const cat = cats.find(c => c.key === a.category);
              const reg = window.PfActivities.countRegistered(a);
              return (
                <tr key={a.id}>
                  <td><b>{a.title}</b>{a.description && <div className="small muted">{a.description.slice(0,60)}{a.description.length>60?"…":""}</div>}</td>
                  <td><Pill kind={cat ? cat.color : "gray"}>{cat ? cat.label : a.category}</Pill></td>
                  <td className="mono small">{a.date}</td>
                  <td className="mono small">{a.time_start ? `${a.time_start}–${a.time_end || ""}` : "—"}</td>
                  <td className="small">{a.location || "—"}</td>
                  <td>
                    {a.cap != null && a.cap > 0 ? (
                      <div className="row gap-2"><span className="mono">{reg}/{a.cap}</span>
                        <div className="meter" style={{width:80}}><span style={{width:Math.min(reg/a.cap*100, 100)+"%"}}></span></div>
                      </div>
                    ) : <span className="mono">{reg}</span>}
                  </td>
                  <td>{a.status === "open" ? <Pill kind="green">เปิดรับ</Pill> : <Pill kind="gray">ปิด</Pill>}</td>
                  <td className="text-right">
                    <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(a)}>แก้ไข</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={open.id ? "แก้ไขกิจกรรม" : "สร้างกิจกรรมใหม่"} onClose={()=>setOpen(null)} width={620}
          footer={<>
            {open.id && <button className="btn btn-ghost" onClick={remove} disabled={busy} style={{marginRight:"auto",color:"#dc2626"}}>ลบ</button>}
            <button className="btn btn-ghost" onClick={()=>setOpen(null)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?"กำลังบันทึก…":"บันทึก"}</button>
          </>}>
          <div className="field"><label>ชื่อกิจกรรม *</label>
            <input className="input" value={open.title} onChange={e=>setOpen(s=>({...s, title:e.target.value}))} placeholder="เช่น ค่ายวิทยาศาสตร์สุขภาพ"/></div>
          <div className="field"><label>รายละเอียด</label>
            <textarea className="textarea" rows={2} value={open.description} onChange={e=>setOpen(s=>({...s, description:e.target.value}))} placeholder="อธิบายกิจกรรม กลุ่มเป้าหมาย ฯลฯ"/></div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}><label>ประเภท</label>
              <select className="select" value={open.category} onChange={e=>setOpen(s=>({...s, category:e.target.value}))}>
                {cats.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select></div>
            <div className="field" style={{flex:1}}><label>สถานะ</label>
              <select className="select" value={open.status} onChange={e=>setOpen(s=>({...s, status:e.target.value}))}>
                <option value="open">เปิดรับสมัคร</option>
                <option value="closed">ปิด</option>
              </select></div>
          </div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}><label>วันที่ *</label>
              <input className="input" type="date" value={open.date} onChange={e=>setOpen(s=>({...s, date:e.target.value}))}/></div>
            <div className="field" style={{flex:1}}><label>เวลาเริ่ม</label>
              <input className="input" type="time" value={open.timeStart} onChange={e=>setOpen(s=>({...s, timeStart:e.target.value}))}/></div>
            <div className="field" style={{flex:1}}><label>เวลาเลิก</label>
              <input className="input" type="time" value={open.timeEnd} onChange={e=>setOpen(s=>({...s, timeEnd:e.target.value}))}/></div>
          </div>
          <div className="row gap-4">
            <div className="field" style={{flex:2}}><label>สถานที่</label>
              <input className="input" value={open.location} onChange={e=>setOpen(s=>({...s, location:e.target.value}))} placeholder="เช่น ห้องประชุมใหญ่"/></div>
            <div className="field" style={{flex:1}}><label>จำนวนที่รับ</label>
              <input className="input" type="number" min="0" value={open.cap} onChange={e=>setOpen(s=>({...s, cap:e.target.value}))} placeholder="ไม่จำกัดเว้นว่าง"/></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Rubrics mgmt ---------- */
function AdminRubrics({ toast }) {
  const backend = !!(window.PfRubrics && window.PF_SUPABASE_READY);
  const all = React.useMemo(() => [
    ...CORE_COMPETENCIES.map(c => ({ ...c, type:"core" })),
    ...SPEC_COMPETENCIES.map(c => ({ ...c, type:"spec" })),
  ], []);
  const [overrides, setOverrides] = React.useState({});  // key -> {data, updated_at}
  const [editing, setEditing] = React.useState(null);    // working draft
  const [editingMeta, setEditingMeta] = React.useState(null); // {key, type}
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!backend) return;
    try {
      const rows = await window.PfRubrics.list();
      const m = {};
      (rows || []).forEach(r => { m[r.key] = r; });
      setOverrides(m);
    } catch (e) { toast("โหลด override ไม่สำเร็จ: " + (e.message||e)); }
  }, [backend, toast]);
  React.useEffect(() => { load(); }, [load]);

  // ผสานค่าเริ่มต้น + override (override ชนะ)
  const merged = React.useMemo(() => all.map(c => ({
    ...c,
    ...(overrides[c.key]?.data || {}),
  })), [all, overrides]);

  const fmtAgo = (iso) => {
    if (!iso) return "—";
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return "เมื่อกี้";
    if (d < 3600) return Math.round(d/60) + " นาทีที่แล้ว";
    if (d < 86400) return Math.round(d/3600) + " ชั่วโมงที่แล้ว";
    return Math.round(d/86400) + " วันที่แล้ว";
  };

  const startEdit = (c) => {
    // clone ลึก เพื่อแก้ไขโดยไม่กระทบของจริง
    const draft = JSON.parse(JSON.stringify(c));
    if (c.type === "spec" && !draft.subs) draft.subs = [];
    if (c.type === "spec" && !draft.tools) draft.tools = [];
    setEditing(draft);
    setEditingMeta({ key: c.key, type: c.type });
  };

  const saveEdit = async () => {
    if (!backend) { toast("บันทึกได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    setBusy(true);
    try {
      // เก็บเฉพาะฟิลด์ที่เปลี่ยนแปลงได้ — name(short/full), desc, subs, tools
      const payload = {
        short: editing.short, full: editing.full, desc: editing.desc,
      };
      if (editingMeta.type === "spec") {
        payload.subs = editing.subs;
        payload.tools = editing.tools;
      }
      await window.PfRubrics.save(editingMeta.key, payload);
      toast("บันทึกรูบริกเรียบร้อย");
      setEditing(null); setEditingMeta(null);
      await load();
    } catch (e) { toast("บันทึกไม่สำเร็จ: " + (e.message||e)); }
    finally { setBusy(false); }
  };

  const resetToDefault = async () => {
    if (!backend) return;
    if (!confirm("กลับเป็นค่าเริ่มต้นของหลักสูตร? (การแก้ที่บันทึกไว้จะหาย)")) return;
    setBusy(true);
    try {
      await window.PfRubrics.reset(editingMeta.key);
      toast("กลับเป็นค่าเริ่มต้นแล้ว");
      setEditing(null); setEditingMeta(null);
      await load();
    } catch (e) { toast("รีเซ็ตไม่สำเร็จ: " + (e.message||e)); }
    finally { setBusy(false); }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pdshs-rubrics.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>จัดการรูบริกสมรรถนะ</h2>
          <div className="muted small">10 สมรรถนะตามหลักสูตร — แก้ทับเฉพาะที่ต้องการได้</div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-ghost btn-sm" onClick={exportJson}>⬇ ส่งออก JSON</button>
        </div>
      </div>
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>สมรรถนะ</th><th>ประเภท</th><th>จำนวนระดับ</th><th>สถานะ</th><th className="text-right">การจัดการ</th></tr></thead>
          <tbody>
            {merged.map(c => {
              const ov = overrides[c.key];
              return (
                <tr key={c.key}>
                  <td><b>{c.short}</b><div className="muted small">{c.full}</div></td>
                  <td>{c.type === "core" ? <Pill kind="blue">สมรรถนะหลัก</Pill> : <Pill kind="pink">สมรรถนะเฉพาะ</Pill>}</td>
                  <td className="num">{c.type === "spec" ? `${(c.subs||[]).length} หัวข้อย่อย × 5` : 5}</td>
                  <td>{ov ? <span className="muted">แก้ไขล่าสุด {fmtAgo(ov.updated_at)}</span> : <span className="muted">ค่าเริ่มต้น</span>}</td>
                  <td className="text-right">
                    <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(c)}>ดู / แก้ไข</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`รูบริก: ${editing.short}`} onClose={()=>{ setEditing(null); setEditingMeta(null); }} width={820}
          footer={<>
            {overrides[editingMeta.key] && (
              <button className="btn btn-ghost" onClick={resetToDefault} disabled={busy} style={{marginRight:"auto",color:"#dc2626"}}>กลับค่าเริ่มต้น</button>
            )}
            <button className="btn btn-ghost" onClick={()=>{ setEditing(null); setEditingMeta(null); }}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>{busy?"กำลังบันทึก…":"บันทึก"}</button>
          </>}>

          <div className="row gap-3" style={{marginBottom:10}}>
            {editingMeta.type === "core" ? <Pill kind="blue">สมรรถนะหลัก</Pill> : <Pill kind="pink">สมรรถนะเฉพาะวิชาเอก</Pill>}
            <span className="muted small mono">{editingMeta.key}</span>
          </div>

          <div className="field">
            <label>ชื่อย่อ (แสดงในตาราง/แท็ก)</label>
            <input className="input" value={editing.short} onChange={e=>setEditing(s=>({...s, short:e.target.value}))}/>
          </div>
          <div className="field">
            <label>ชื่อเต็ม</label>
            <input className="input" value={editing.full} onChange={e=>setEditing(s=>({...s, full:e.target.value}))}/>
          </div>
          <div className="field">
            <label>คำอธิบาย</label>
            <textarea className="textarea" rows={3} value={editing.desc} onChange={e=>setEditing(s=>({...s, desc:e.target.value}))}/>
          </div>

          {editingMeta.type === "spec" && (
            <>
              <div className="divider-h"></div>
              <h3>สมรรถนะย่อย ({(editing.subs||[]).length} หัวข้อ)</h3>
              <div className="muted small" style={{marginTop:-6,marginBottom:10}}>แต่ละหัวข้อมีเกณฑ์พฤติกรรมบ่งชี้ 5 ระดับ (เริ่มต้น → เชี่ยวชาญ)</div>
              {(editing.subs||[]).map((sub, si) => (
                <div key={si} className="card card-tight" style={{padding:14,marginBottom:12,border:"1px solid var(--line)"}}>
                  <div className="row gap-3" style={{alignItems:"center",marginBottom:10}}>
                    <span className="mono muted small">{sub.key}</span>
                    <input className="input" style={{flex:1}} value={sub.name}
                      onChange={e=>setEditing(s=>{ const c={...s, subs:[...s.subs]}; c.subs[si]={...c.subs[si], name:e.target.value}; return c; })}/>
                  </div>
                  {(sub.levels||[]).map((lv, li) => (
                    <div key={li} className="field" style={{marginBottom:8}}>
                      <label style={{color: LEVEL_NAMES[li]?.color, fontWeight:600}}>ระดับ {li+1} — {LEVEL_NAMES[li]?.label}</label>
                      <textarea className="textarea" rows={2} value={lv}
                        onChange={e=>setEditing(s=>{
                          const c={...s, subs:[...s.subs]};
                          c.subs[si]={...c.subs[si], levels:[...c.subs[si].levels]};
                          c.subs[si].levels[li]=e.target.value;
                          return c;
                        })}/>
                    </div>
                  ))}
                </div>
              ))}

              <div className="divider-h"></div>
              <h3>เครื่องมือ/ชิ้นงานสำหรับเก็บหลักฐาน</h3>
              {(editing.tools||[]).map((tool, ti) => (
                <div key={ti} className="row gap-2" style={{marginBottom:6}}>
                  <input className="input" style={{flex:1}} value={tool}
                    onChange={e=>setEditing(s=>{ const c={...s, tools:[...s.tools]}; c.tools[ti]=e.target.value; return c; })}/>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(s=>({...s, tools:s.tools.filter((_,i)=>i!==ti)}))}>ลบ</button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(s=>({...s, tools:[...(s.tools||[]),""]}))}>+ เพิ่มเครื่องมือ</button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------- Reports ---------- */
function AdminReports() {
  return (
    <div className="page">
      <h2 style={{fontSize:22}}>รายงานและภาพรวม</h2>

      <div className="stat-grid mt-3" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <div className="stat stat-blue"><div className="num">—</div><div className="lbl">คะแนนเฉลี่ยรวม</div></div>
        <div className="stat stat-green"><div className="num">—</div><div className="lbl">นักเรียนใช้งาน 7 วันล่าสุด</div></div>
        <div className="stat stat-amber"><div className="num">—</div><div className="lbl">เวลาเฉลี่ยรอประเมิน</div></div>
        <div className="stat stat-purple"><div className="num">—</div><div className="lbl">หลักฐานที่ส่งเดือนนี้</div></div>
      </div>

      <div className="card mt-5 muted" style={{padding:30,textAlign:"center"}}>
        รายงานจะแสดงเมื่อมีข้อมูลการใช้งานในระบบ (นักเรียนส่งหลักฐาน + อาจารย์ประเมิน)
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function AdminSettings({ toast, onLogout }) {
  const me = window.pfCurrentUser || {};
  const [cfg, setCfg] = React.useState({
    semester: "1/2567",
    allowSelfRegister: false,
    backupNightly: true,
    emailNotify: true,
    twoFA: false,
    schoolName: "โรงเรียนสาธิต มศว ปทุมวัน",
    primary: "#2f6bff",
  });
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));
  return (
    <div className="page">
      <h2 style={{fontSize:22}}>ตั้งค่าระบบ</h2>

      <div className="profile-grid">
        <div className="card">
          <h3>ข้อมูลผู้ดูแล</h3>
          <div className="row gap-3" style={{alignItems:"center"}}>
            <div className="avatar-lg" style={{background:"linear-gradient(135deg,#fda4af,#fb7185)", width:72, height:72, fontSize:34}}>🛡️</div>
            <div>
              <div style={{fontWeight:600, fontSize:17}}>{me.name || "ผู้ดูแลระบบ"}</div>
              <div className="muted small">{me.email || "—"}</div>
              <div className="muted small mono">{me.id ? me.id.slice(0,8) : "—"}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-block mt-5" onClick={onLogout}>ออกจากระบบ</button>
          <ChangePasswordCard toast={toast}/>
        </div>

        <div className="card">
          <h3>การตั้งค่าทั่วไป</h3>
          <div className="field"><label>ชื่อสถานศึกษา</label>
            <input className="input" value={cfg.schoolName} onChange={e=>set("schoolName", e.target.value)}/></div>
          <div className="field"><label>ภาคเรียนปัจจุบัน</label>
            <select className="select" value={cfg.semester} onChange={e=>set("semester", e.target.value)}>
              <option>1/2567</option><option>2/2567</option><option>1/2568</option>
            </select></div>
          <div className="field"><label>สีหลักของระบบ</label>
            <div className="row gap-2">
              {["#2f6bff","#0ea5e9","#10b981","#8b5cf6","#ec4899"].map(c => (
                <button key={c} onClick={()=>set("primary", c)} aria-label={c}
                  style={{width:34, height:34, borderRadius:8, background:c, border: cfg.primary===c ? "2px solid #0f172a":"2px solid transparent"}}></button>
              ))}
            </div>
          </div>

          <div className="divider-h"></div>
          <h3>ความปลอดภัยและการแจ้งเตือน</h3>
          <Toggle label="อนุญาตให้นักเรียนสมัครเอง" value={cfg.allowSelfRegister} onChange={v=>set("allowSelfRegister", v)}/>
          <Toggle label="สำรองข้อมูลรายคืน" value={cfg.backupNightly} onChange={v=>set("backupNightly", v)}/>
          <Toggle label="แจ้งเตือนทางอีเมล" value={cfg.emailNotify} onChange={v=>set("emailNotify", v)}/>
          <Toggle label="บังคับยืนยันตัวตนสองชั้น (2FA)" value={cfg.twoFA} onChange={v=>set("twoFA", v)}/>

          <button className="btn btn-primary btn-block mt-5" onClick={()=>toast("บันทึกการตั้งค่าเรียบร้อย")}>บันทึกการตั้งค่า</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="row-between" style={{padding:"8px 0"}}>
      <span>{label}</span>
      <button
        onClick={()=>onChange(!value)}
        style={{
          width:44, height:24, borderRadius:999, border:0,
          background: value ? "var(--primary)" : "var(--line-2)",
          position:"relative", cursor:"pointer", transition:".15s"
        }}>
        <span style={{
          position:"absolute", top:3, left: value ? 22 : 3, width:18, height:18,
          borderRadius:"50%", background:"#fff", transition:".15s"
        }}></span>
      </button>
    </div>
  );
}

window.ADMIN_NAV = ADMIN_NAV;
Object.assign(window, {
  AdminHome, AdminUsers, AdminActivities, AdminRubrics, AdminReports, AdminSettings,
});

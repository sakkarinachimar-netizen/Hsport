/* student.jsx — Student role pages */

const STUDENT_NAV = [
  { key: "home", label: "หน้าแรก" },
  { key: "portfolio", label: "แฟ้มสะสมผลงาน" },
  { key: "upload", label: "อัปโหลดหลักฐาน" },
  { key: "rubrics", label: "รูบริกสมรรถนะ" },
  { key: "activities", label: "กิจกรรม" },
  { key: "internship", label: "ฝึกงาน" },
  { key: "profile", label: "โปรไฟล์" },
];

/* ---------- Default empty data (จะถูกแทนที่ด้วยข้อมูลจริงจาก DB/profile) ---------- */
function currentProfile() {
  const u = window.pfCurrentUser || {};
  return {
    studentId: u.student_code || "",
    name: u.name || "",
    classroom: u.grade || "",
    school: "โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน",
    email: u.email || "",
    phone: u.phone || "",
    advisor: u.advisor_name || "",
  };
}
const SELF = currentProfile();

/* Default level = 0 ทุกสมรรถนะ จนกว่าจะมีการประเมินจริง */
const MY_LEVELS = Object.fromEntries(
  [...CORE_COMPETENCIES, ...SPEC_COMPETENCIES].map(c => [c.key, 0])
);
const RADAR_LABELS = [
  ...CORE_COMPETENCIES.map(c => c.short),
  ...SPEC_COMPETENCIES.map(c => c.short),
];
const RADAR_VALUES = RADAR_LABELS.map(() => 0);

const PORTFOLIO = [];
const ACTIVITIES = [];
/* ---------- Home ---------- */
function StudentHome({ go, toast }) {
  return (
    <div className="page">
      <div className="hero">
        <div className="avatar">👩‍🎓</div>
        <div>
          <h1>สวัสดี {(window.pfCurrentUser||{}).name || "นักเรียน"}</h1>
          <p>{((window.pfCurrentUser||{}).grade ? "ชั้น "+window.pfCurrentUser.grade+" • " : "")}โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน</p>
          <a>บันทึกหลักฐานจริงของการเรียนรู้ แล้วดูพัฒนาการของคุณอย่างโปร่งใส</a>
        </div>
      </div>

      <div className="two-col mt-5">
        <div className="card">
          <h2>สรุประดับสมรรถนะของฉัน</h2>
          <div className="muted small" style={{margin:"-6px 0 10px"}}>สมรรถนะหลัก (Core Competencies)</div>
          {CORE_COMPETENCIES.map(c => (
            <div className="comp-row" key={c.key}>
              <div className="lbl"><span>{c.short}</span><span className="muted">{MY_LEVELS[c.key] > 0 ? `${LEVEL_NAMES[MY_LEVELS[c.key]-1].label} (${MY_LEVELS[c.key]}/5)` : "ยังไม่ประเมิน"}</span></div>
              <ProgressBar value={MY_LEVELS[c.key]} max={5}/>
            </div>
          ))}
          <div className="muted small mt-5" style={{marginBottom:6}}>สมรรถนะเฉพาะวิชาเอก (Professional)</div>
          {SPEC_COMPETENCIES.map(c => (
            <div className="comp-row" key={c.key}>
              <div className="lbl"><span>{c.short}</span><span className="muted">{MY_LEVELS[c.key] > 0 ? `${LEVEL_NAMES[MY_LEVELS[c.key]-1].label} (${MY_LEVELS[c.key]}/5)` : "ยังไม่ประเมิน"}</span></div>
              <ProgressBar value={MY_LEVELS[c.key]} max={5}/>
            </div>
          ))}
        </div>

        <div>
          <div className="card">
            <h2>ภาพรวมสมรรถนะ</h2>
            <div className="radar-wrap">
              <RadarChart labels={RADAR_LABELS} values={RADAR_VALUES} max={5} size={380}/>
            </div>
          </div>

          <div className="card mt-4">
            <h2>การดำเนินการด่วน</h2>
            <button className="btn btn-grad btn-block mt-2" onClick={() => go("upload")}>
              <Icons.plus/> เพิ่มหลักฐานใหม่
            </button>
            <button className="btn btn-grad-2 btn-block mt-3" onClick={() => go("rubrics")}>
              <Icons.doc/> ดูคำแนะนำเพื่อพัฒนา
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-5">
        <div className="row-between"><h2 className="mb-0">หลักฐานล่าสุด</h2>
          <button className="btn btn-ghost btn-sm" onClick={()=>go("portfolio")}>ดูทั้งหมด →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14, marginTop:14}}>
          {PORTFOLIO.slice(0,3).map(p => (
            <div key={p.id} className="card card-tight" style={{padding:14}}>
              <Pill kind={p.status.kind}>{p.status.label}</Pill>
              <h3 style={{margin:"8px 0 4px",fontSize:15, lineHeight:1.35}}>{p.title}</h3>
              <div className="muted small">📅 {p.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Portfolio list ---------- */
const EV_STATUS = {
  approved: { kind:"green",  label:"✅ ผ่าน" },
  revise:   { kind:"purple", label:"🔁 ต้องปรับปรุง" },
  pending:  { kind:"amber",  label:"⌛ รอตรวจ" },
};
function mapEvidenceRow(r) {
  const evals = (r.evaluations || []).slice().sort((a,b)=> (a.created_at < b.created_at ? 1 : -1));
  const ev = evals[0];
  const comps = [...(r.core_competencies||[]), ...(r.spec_competencies||[])];
  return {
    id: r.id, title: r.title, desc: r.reflection || "",
    date: r.date || "—",
    driveLinks: (r.evidence_drive_links || []).map(l => parseDriveLink(l.url)),
    files: "",
    tags: comps.map(name => ({ l:name, k:"blue" })),
    status: EV_STATUS[r.status] || EV_STATUS.pending,
    note: ev ? (ev.comment ? "ความเห็น: " + ev.comment : "ประเมินแล้ว") : "รอการประเมินจากอาจารย์",
    score: ev ? ev.score : null,
  };
}

function StudentPortfolio({ toast }) {
  const backend = !!(window.PfEvidence && window.PF_SUPABASE_READY && window.pfCurrentUser);
  const [items, setItems] = React.useState(backend ? [] : PORTFOLIO);
  const [loading, setLoading] = React.useState(backend);
  const [stat, setStat] = React.useState("all");
  const [open, setOpen] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const doDelete = async () => {
    if (!backend) { toast("ลบได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    setBusy(true);
    try {
      await window.PfEvidence.remove(confirmDel.id);
      const title = confirmDel.title;
      setConfirmDel(null);
      toast(`ลบ "${title}" ออกจากแฟ้มแล้ว`);
      await load();
    } catch (e) { toast("ลบไม่สำเร็จ: " + (e.message || e)); }
    finally { setBusy(false); }
  };

  const load = React.useCallback(async () => {
    if (!backend) { setItems(PORTFOLIO); setLoading(false); return; }
    setLoading(true);
    try {
      const rows = await window.PfEvidence.listMine(window.pfCurrentUser.id);
      setItems((rows || []).map(mapEvidenceRow));
    } catch (e) { toast("โหลดแฟ้มผลงานไม่สำเร็จ: " + (e.message || e)); }
    finally { setLoading(false); }
  }, [backend, toast]);
  React.useEffect(() => { load(); }, [load]);

  const list = items.filter(p => stat === "all" || (p.status.label || "").includes(stat));

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <h2 className="mb-0" style={{fontSize:22}}>แฟ้มสะสมผลงานของฉัน</h2>
        <div className="filterbar">
          <select className="select" value={stat} onChange={e=>setStat(e.target.value)}>
            <option value="all">ทุกสถานะ</option>
            <option>ผ่าน</option>
            <option>รอตรวจ</option>
            <option>ต้องปรับปรุง</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="muted" style={{padding:20}}>กำลังโหลด…</div>
      ) : list.length === 0 ? (
        <div className="card muted" style={{padding:24,textAlign:"center"}}>ยังไม่มีหลักฐานในแฟ้ม — ไปที่ "อัปโหลดหลักฐาน" เพื่อเพิ่มชิ้นแรก</div>
      ) : (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {list.map(p => (
          <div className="item" key={p.id}>
            <div className="body">
              <h3>{p.title}</h3>
              <div className="muted small">{p.desc}</div>
              <div className="meta">
                <span>📅 {p.date}</span>
                {p.driveLinks && p.driveLinks.filter(Boolean).length > 0
                  ? <span>📎 {p.driveLinks.filter(Boolean).length} ลิงก์ Drive</span>
                  : <span>📁 {p.files}</span>}
              </div>
              <div className="tags">
                {p.tags.map((t,i)=> <Pill key={i} kind={t.k}>{t.l}</Pill>)}
              </div>
              <div className="status-line">
                <Pill kind={p.status.kind}>{p.status.label}</Pill>
                <span>{p.note}</span>
              </div>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <button className="btn btn-primary btn-sm" onClick={()=>setOpen(p)}>ดูรายละเอียด</button>
              {backend && (
                <button className="btn btn-ghost btn-sm" onClick={()=>setConfirmDel(p)} style={{color:"#dc2626"}}>ลบ</button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {open && (
        <Modal title={open.title} onClose={()=>setOpen(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setOpen(null)}>ปิด</button>
            <button className="btn btn-soft" onClick={()=>{ toast("ดาวน์โหลดเอกสาร (จำลอง)"); }}>ดาวน์โหลด</button>
          </>}>
          <div className="row gap-3" style={{marginBottom:10}}>
            <Pill kind={open.status.kind}>{open.status.label}</Pill>
            {open.score && <Pill kind="blue">คะแนน {open.score}/5</Pill>}
            <span className="muted small">📅 {open.date}</span>
          </div>
          <p>{open.desc}</p>
          <div className="divider-h"></div>
          <div className="small muted">สมรรถนะที่เกี่ยวข้อง</div>
          <div className="tags" style={{marginTop:6}}>
            {open.tags.map((t,i)=> <Pill key={i} kind={t.k}>{t.l}</Pill>)}
          </div>
          <div className="divider-h"></div>
          <div className="small muted">ไฟล์แนบ / หลักฐาน</div>
          {open.driveLinks && open.driveLinks.length > 0 ? (
            <div style={{marginTop:10}}>
              <DrivePreviewGrid items={open.driveLinks.filter(Boolean)}/>
            </div>
          ) : (
            <div style={{marginTop:6}}>{open.files}</div>
          )}
          <div className="divider-h"></div>
          <div className="small muted">ความเห็นจากอาจารย์</div>
          <div style={{marginTop:6}}>{open.note}</div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="ยืนยันการลบหลักฐาน" onClose={()=>setConfirmDel(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setConfirmDel(null)}>ยกเลิก</button>
            <button className="btn btn-danger" onClick={doDelete} disabled={busy}>{busy?"กำลังลบ…":"ลบหลักฐาน"}</button>
          </>}>
          <div>ลบ <b>"{confirmDel.title}"</b> ออกจากแฟ้มสะสมผลงาน?</div>
          <div className="muted small mt-3" style={{lineHeight:1.7}}>
            • ลิงก์หลักฐานทั้งหมดจะถูกลบ<br/>
            • หากอาจารย์เคยให้คะแนน/ความเห็นไว้ — จะถูกลบตาม<br/>
            • <b>การลบไม่สามารถยกเลิกได้</b><br/>
            • หากต้องการแก้ไข ให้ลบอันนี้แล้วกดอัปโหลดใหม่
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Upload ---------- */
function StudentUpload({ toast, go }) {
  const [form, setForm] = React.useState({
    title: "", date: "", desc: "",
    core: [], spec: [], driveLinks: [], teacherId: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [teachers, setTeachers] = React.useState([]);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm(f => {
    const set = new Set(f[k]); set.has(v) ? set.delete(v) : set.add(v);
    return { ...f, [k]: [...set] };
  });

  // โหลดรายชื่ออาจารย์ตอนเปิดหน้า
  React.useEffect(() => {
    if (!window.PfUsers || !window.PF_SUPABASE_READY) return;
    (async () => {
      try {
        const all = await window.PfUsers.list();
        setTeachers((all || []).filter(u => u.role === "teacher"));
      } catch (e) { /* ignore — fallback to empty list */ }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.desc) { toast("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (form.driveLinks.length === 0) { toast("กรุณาแนบลิงก์หลักฐานอย่างน้อย 1 ลิงก์"); return; }
    if (teachers.length > 0 && !form.teacherId) { toast("กรุณาเลือกอาจารย์ผู้ประเมิน"); return; }
    const backend = window.PfEvidence && window.PF_SUPABASE_READY && window.pfCurrentUser;
    if (backend) {
      setBusy(true);
      try {
        await window.PfEvidence.create({
          studentId: window.pfCurrentUser.id,
          title: form.title, date: form.date, kind: null,
          core: form.core, spec: form.spec, reflection: form.desc,
          driveLinks: form.driveLinks.map(d => d.originalUrl || d),
          assignedTeacherId: form.teacherId || null,
        });
        toast("ส่งหลักฐานเรียบร้อย • สถานะ: รอตรวจ");
        setTimeout(()=>go("portfolio"), 700);
      } catch (e2) {
        toast("บันทึกไม่สำเร็จ: " + (e2.message || e2));
      } finally { setBusy(false); }
      return;
    }
    // โหมดสาธิต
    toast(`ส่งหลักฐานเรียบร้อย — แนบ ${form.driveLinks.length} ลิงก์ • สถานะ: รอตรวจ`);
    setTimeout(()=>go("portfolio"), 800);
  };

  const coreOpts = CORE_COMPETENCIES.map(c => c.full);
  const specOpts = SPEC_COMPETENCIES.map(c => c.full);

  return (
    <div className="page">
      <h2 style={{fontSize:22}}>อัปโหลดหลักฐานใหม่</h2>
      <form className="card" onSubmit={submit}>
        <div className="field">
          <label>ชื่อชิ้นงาน/กิจกรรม *</label>
          <input className="input" placeholder="เช่น โครงงานวิจัย, การนำเสนอ, บทสะท้อน"
                 value={form.title} onChange={e=>upd("title", e.target.value)}/>
        </div>
        <div className="field">
          <label>วันที่ *</label>
          <input className="input" type="date" value={form.date} onChange={e=>upd("date", e.target.value)}/>
        </div>
        <div className="field">
          <label>คำอธิบายสั้น *</label>
          <textarea className="textarea" placeholder="อธิบายสั้นๆ เกี่ยวกับชิ้นงานนี้ เป้าหมาย และสิ่งที่ได้เรียนรู้"
                    value={form.desc} onChange={e=>upd("desc", e.target.value)}/>
        </div>

        <div className="field">
          <label>สมรรถนะที่เกี่ยวข้อง * (เลือกได้หลายข้อ)</label>
          <div className="upload-grid">
            <div>
              <div className="small" style={{fontWeight:600, marginBottom:6}}>สมรรถนะหลัก</div>
              {coreOpts.map(o => (
                <label key={o} className="checkbox-row">
                  <input type="checkbox" checked={form.core.includes(o)} onChange={()=>toggle("core", o)}/>
                  <span>{o}</span>
                </label>
              ))}
            </div>
            <div>
              <div className="small" style={{fontWeight:600, marginBottom:6}}>สมรรถนะเฉพาะ</div>
              {specOpts.map(o => (
                <label key={o} className="checkbox-row">
                  <input type="checkbox" checked={form.spec.includes(o)} onChange={()=>toggle("spec", o)}/>
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="field">
          <label>แนบหลักฐาน (Google Drive / Docs / Sheets / Slides) *</label>
          <DriveLinkInput value={form.driveLinks} onChange={(v)=>upd("driveLinks", v)}/>
        </div>

        <div className="field">
          <label>ส่งให้อาจารย์ผู้ประเมิน *</label>
          {teachers.length > 0 ? (
            <select className="select" value={form.teacherId} onChange={e=>upd("teacherId", e.target.value)} required>
              <option value="">— เลือกอาจารย์ —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}{t.email ? ` (${t.email})` : ""}</option>
              ))}
            </select>
          ) : (
            <div className="muted small" style={{padding:8, background:"var(--bg-soft)", borderRadius:8}}>
              ยังไม่มีอาจารย์ในระบบ — ติดต่อแอดมินให้สร้างบัญชีอาจารย์ก่อน
            </div>
          )}
        </div>

        <div className="row-between mt-3">
          <span className="muted small">หลักฐานจะปรากฏในรายการ "ต้องตรวจ" ของอาจารย์ที่เลือก</span>
          <div className="row gap-3">
            <button type="button" className="btn btn-ghost" onClick={()=>go("home")}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "กำลังส่ง…" : "ส่งหลักฐาน"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- Rubrics page ---------- */
function StudentRubrics() {
  const [tab, setTab] = React.useState("spec"); // 'core' | 'spec'
  return (
    <div className="page">
      <h2 style={{fontSize:22}}>รูบริกสมรรถนะและพฤติกรรมบ่งชี้</h2>
      <div className="muted small" style={{marginTop:-6}}>
        อ้างอิงจากหลักสูตรวิชาเอกวิทยาศาสตร์สุขภาพ พ.ศ. 2568 — โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน
      </div>

      <div className="tabs mt-4">
        <button className={tab==="spec"?"active":""} onClick={()=>setTab("spec")}>
          สมรรถนะเฉพาะวิชาเอก (4 ข้อ)
        </button>
        <button className={tab==="core"?"active":""} onClick={()=>setTab("core")}>
          สมรรถนะหลัก (6 ข้อ)
        </button>
      </div>

      {/* Level legend */}
      <div className="card card-tight" style={{padding:"12px 16px", marginBottom:16}}>
        <div className="row gap-3" style={{flexWrap:"wrap"}}>
          <div className="small" style={{fontWeight:600}}>เกณฑ์ระดับ:</div>
          {LEVEL_NAMES.map(l => (
            <div key={l.n} className="row gap-2">
              <span className="dot" style={{background: l.color, width:12, height:12, borderRadius:"50%"}}></span>
              <span className="small"><b>{l.short}</b> {l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {tab === "spec" && SPEC_COMPETENCIES.map(c => (
        <SpecRubricCard key={c.key} comp={c}/>
      ))}

      {tab === "core" && (
        <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16}}>
          {CORE_COMPETENCIES.map(c => <CoreRubricCard key={c.key} comp={c}/>)}
        </div>
      )}
    </div>
  );
}

function SpecRubricCard({ comp }) {
  return (
    <div className={`card rubric-card ${comp.color === "primary" ? "" : comp.color}`} style={{marginBottom:20, padding:24}}>
      <div className="row-between" style={{flexWrap:"wrap", gap:8}}>
        <div>
          <h3 style={{marginBottom:4}}>{comp.full}</h3>
          <div className="muted small" style={{maxWidth:780}}>{comp.desc}</div>
        </div>
        <Pill kind={comp.color === "primary" ? "blue" : comp.color === "teal" ? "teal" : comp.color === "purple" ? "purple" : "pink"}>
          สมรรถนะเฉพาะวิชาเอก
        </Pill>
      </div>

      <div style={{overflowX:"auto", marginTop:14}}>
        <table className="rubric-table" style={{minWidth: 920}}>
          <thead>
            <tr>
              <th style={{width:200}}>องค์ประกอบ</th>
              {LEVEL_NAMES.map(l => (
                <th key={l.n} style={{minWidth:140}}>
                  <div style={{fontWeight:600, color: l.color}}>{l.short} {l.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comp.subs.map(s => (
              <tr key={s.key}>
                <td>
                  <div style={{fontWeight:600}}><span className="mono small muted">{s.key}</span> {s.name}</div>
                </td>
                {s.levels.map((txt, i) => (
                  <td key={i} className="small" style={{verticalAlign:"top"}}>{txt}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tip-box mt-4">
        <div className="h">🧰 เครื่องมือ/ชิ้นงานที่ใช้ประเมิน</div>
        <ul>{comp.tools.map((t,i)=> <li key={i}>{t}</li>)}</ul>
      </div>
    </div>
  );
}

function CoreRubricCard({ comp }) {
  return (
    <div className="card" style={{padding:20, borderTop:"4px solid var(--primary)"}}>
      <h3 style={{color:"var(--primary-2)", marginBottom:8}}>{comp.short}</h3>
      <div className="muted small" style={{marginBottom:12}}>{comp.desc}</div>
      <div className="small" style={{fontWeight:600, color:"var(--ink-2)", marginBottom:6}}>ระดับการพัฒนา</div>
      <ol style={{margin:0, paddingLeft:20, fontSize:14}}>
        {LEVEL_NAMES.map(l => (
          <li key={l.n} style={{margin:"4px 0"}}>
            <b style={{color: l.color}}>{l.label}</b>
            <span className="muted"> — {coreLevelDesc(comp.key, l.n)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* Generic level descriptions for core competencies (5-level rubric) */
function coreLevelDesc(key, level) {
  const generic = [
    "แสดงพฤติกรรมเมื่อได้รับการกระตุ้น/ชี้แนะ",
    "เริ่มทำเองในบริบทง่าย ยังต้องการการสนับสนุน",
    "ทำได้อย่างเป็นระบบ สม่ำเสมอ ในสถานการณ์ทั่วไป",
    "นำไปประยุกต์/ต่อยอด มีแผนพัฒนาตนเองชัดเจน",
    "เป็นแบบอย่าง/ผู้นำ สร้างแรงบันดาลใจให้ผู้อื่น",
  ];
  return generic[level - 1];
}

/* ---------- Activities ---------- */
function StudentActivities({ toast }) {
  const cells = [
    { d:"29", muted:true }, { d:"30", muted:true }, { d:"31", muted:true },
    { d:"1" }, { d:"2" }, { d:"3" }, { d:"4" },
    { d:"5" }, { d:"6" }, { d:"7" }, { d:"8" }, { d:"9" }, { d:"10" }, { d:"11" },
    { d:"12" }, { d:"13" }, { d:"14" },
    { d:"15", color:"green" }, { d:"16" }, { d:"17" },
    { d:"18", color:"blue" },
    { d:"19" }, { d:"20" }, { d:"21" },
    { d:"22", color:"pink" }, { d:"23" }, { d:"24" }, { d:"25" },
  ];
  const [registered, setRegistered] = React.useState({});
  const reg = (id) => { setRegistered(r => ({...r, [id]: true })); toast("ลงทะเบียนเรียบร้อย"); };

  return (
    <div className="page">
      <h2 style={{fontSize:22}}>กิจกรรมและโครงการ</h2>

      <div className="card">
        <h3>ปฏิทินกิจกรรม</h3>
        <div className="cal">
          <div className="cal-grid">
            {["อา","จ","อ","พ","พฤ","ศ","ส"].map(h => <div className="cal-h" key={h}>{h}</div>)}
            {cells.map((c,i)=>(
              <div key={i} className={`cal-cell ${c.muted?"muted":""} ${c.color||""}`}>{c.d}</div>
            ))}
          </div>
          <div className="cal-legend">
            <span><span className="dot dot-green"></span> งานวิจัย</span>
            <span><span className="dot dot-blue"></span> การนำเสนอ</span>
            <span><span className="dot dot-pink"></span> ค่าย/สหกิจ</span>
          </div>
        </div>
      </div>

      <h3 className="mt-6">กิจกรรมที่กำลังจะมาถึง</h3>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {ACTIVITIES.map(a => (
          <div className="event" key={a.id}>
            <div className="body" style={{flex:1}}>
              <h4>{a.title}</h4>
              <div className="muted small">{a.desc}</div>
              <div className="meta">
                <span>📅 {a.date}</span>
                <span>📍 {a.place}</span>
                {a.time && <span>🕐 {a.time}</span>}
                {a.seats && <span>👥 {a.seats}</span>}
              </div>
            </div>
            {registered[a.id]
              ? <Pill kind="green">✓ ลงทะเบียนแล้ว</Pill>
              : <button className={`btn ${a.cta.kind}`} onClick={()=>reg(a.id)}>{a.cta.label}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */
function StudentProfile({ toast, onLogout }) {
  const [u, setU] = React.useState(currentProfile());
  const upd = (k, v) => setU(s => ({ ...s, [k]: v }));
  const save = () => toast("บันทึกการเปลี่ยนแปลงเรียบร้อย");

  return (
    <div className="page">
      <h2 style={{fontSize:22}}>โปรไฟล์ของฉัน</h2>
      <div className="profile-grid">
        <div className="card profile-card">
          <div className="avatar-lg">👩‍🎓</div>
          <h2>{u.name}</h2>
          <div className="role">นักเรียนวิชาเอกวิทยาศาสตร์สุขภาพ</div>

          <div className="field mt-5" style={{textAlign:"left"}}>
            <label>รหัสนักเรียน</label>
            <input className="input" value={u.studentId} onChange={e=>upd("studentId", e.target.value)} />
          </div>
          <div className="field" style={{textAlign:"left"}}>
            <label>ชั้น/ห้อง</label>
            <input className="input" value={u.classroom} onChange={e=>upd("classroom", e.target.value)} />
          </div>
          <div className="field" style={{textAlign:"left"}}>
            <label>อีเมล</label>
            <input className="input" value={u.email} onChange={e=>upd("email", e.target.value)} />
          </div>
          <div className="field" style={{textAlign:"left"}}>
            <label>เบอร์โทรศัพท์</label>
            <input className="input" value={u.phone} onChange={e=>upd("phone", e.target.value)} />
          </div>
          <div className="field" style={{textAlign:"left"}}>
            <label>อาจารย์ที่ปรึกษา</label>
            <input className="input" value={u.advisor} onChange={e=>upd("advisor", e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" onClick={save}>บันทึกการเปลี่ยนแปลง</button>
          <button className="btn btn-danger btn-block mt-3" onClick={onLogout}>ออกจากระบบ</button>
        </div>

        <div>
          <div className="card">
            <h3>สถิติการใช้งาน</h3>
            <div className="stat-grid">
              <div className="stat stat-blue"><div className="num">—</div><div className="lbl">หลักฐานทั้งหมด</div></div>
              <div className="stat stat-green"><div className="num">—</div><div className="lbl">ผ่านการประเมิน</div></div>
              <div className="stat stat-amber"><div className="num">—</div><div className="lbl">รอการตรวจ</div></div>
              <div className="stat stat-purple"><div className="num">—</div><div className="lbl">คะแนนเฉลี่ย</div></div>
            </div>
          </div>

          <div className="card mt-4">
            <h3>ความก้าวหน้าล่าสุด</h3>
            <div className="muted" style={{padding:"14px 0"}}>เริ่มอัปโหลดหลักฐานเพื่อเห็นพัฒนาการของแต่ละสมรรถนะ</div>
          </div>

          <ChangePasswordCard toast={toast}/>

          <div className="privacy mt-4">
            <div className="h">🔒 ความปลอดภัยข้อมูล</div>
            <div className="mt-2">เว็บไซต์นี้ใช้ข้อมูลเฉพาะเพื่อการเรียนรู้ภายในโรงเรียน โปรดไม่เผยแพร่เลขประจำตัวประชาชนต่อสาธารณะ</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.STUDENT_NAV = STUDENT_NAV;
Object.assign(window, {
  StudentHome, StudentPortfolio, StudentUpload, StudentRubrics, StudentActivities, StudentProfile,
});

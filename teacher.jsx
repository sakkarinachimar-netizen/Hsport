/* teacher.jsx — Teacher/Evaluator role pages */

const TEACHER_NAV = [
  { key: "t-home",    label: "หน้าแรก" },
  { key: "t-review",  label: "รายการที่ต้องตรวจ" },
  { key: "t-students",label: "นักเรียนในที่ปรึกษา" },
  { key: "t-internship", label: "ฝึกงาน" },
  { key: "t-history", label: "ประวัติการประเมิน" },
  { key: "t-announce",label: "ประกาศ/นัดหมาย" },
  { key: "t-profile", label: "โปรไฟล์" },
];

const TEACHER_SELF = {};
const REVIEW_QUEUE = [];
const MY_STUDENTS = [];
const HISTORY = [];
/* ---------- Teacher Home / Dashboard ---------- */
function TeacherHome({ go }) {
  const u = window.pfCurrentUser || {};
  return (
    <div className="page">
      <div className="hero">
        <Avatar emoji="👨‍🏫" size={64} gradient="linear-gradient(135deg,#22d3ee,#3b82f6)"/>
        <div>
          <h1>สวัสดี {u.name || "อาจารย์"}</h1>
          <p>อาจารย์ผู้ประเมิน • PDS_HS Portfolio System</p>
          <a>ตรวจหลักฐานนักเรียน บันทึกผลการประเมินสมรรถนะ</a>
        </div>
      </div>

      <div className="stat-grid mt-5" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <div className="stat stat-blue"><div className="num">—</div><div className="lbl">นักเรียนในที่ปรึกษา</div></div>
        <div className="stat stat-amber"><div className="num">—</div><div className="lbl">หลักฐานรอตรวจ</div></div>
        <div className="stat stat-green"><div className="num">—</div><div className="lbl">ประเมินแล้ว (เทอมนี้)</div></div>
        <div className="stat stat-purple"><div className="num">—</div><div className="lbl">คะแนนเฉลี่ยห้อง</div></div>
      </div>

      <div className="card mt-5">
        <div className="row-between"><h2 className="mb-0">รายการรอตรวจ</h2>
          <button className="btn btn-ghost btn-sm" onClick={()=>go("t-review")}>ดูทั้งหมด →</button>
        </div>
        <div className="muted" style={{padding:"30px 0",textAlign:"center"}}>ยังไม่มีหลักฐานที่รอการประเมิน</div>
      </div>
    </div>
  );
}

/* ---------- Review Queue with eval modal ---------- */
function TeacherReview({ toast }) {
  const backend = !!(window.PfEvidence && window.PF_SUPABASE_READY && window.pfCurrentUser);
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(backend);
  const [open, setOpen] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [busy, setBusy] = React.useState(false);
  const [eval_, setEval_] = React.useState({ score: 4, status: "approve", comment: "", levels: {} });

  // map DB row → display shape ที่ TeacherReview ใช้
  const mapRow = (r) => ({
    id: r.id,
    dbRow: r,                      // เก็บไว้ใช้ตอนบันทึก
    title: r.title,
    student: r.student?.name || "—",
    studentId: r.student?.student_code || (r.student_id ? r.student_id.slice(0,8) : "—"),
    classroom: r.student?.grade || "—",
    sub: r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH") : "—",
    desc: r.reflection || "",
    comps: [...(r.core_competencies||[]), ...(r.spec_competencies||[])],
    files: [],
    date: r.date || "—",
    driveLinks: (r.evidence_drive_links || []).map(l => parseDriveLink(l.url)),
    urgency: "blue",
    // alreadyEvaluated: (r.evaluations || []).length > 0,
    pending: r.status === "pending",
  });

  const load = React.useCallback(async () => {
    if (!backend) { setList([]); setLoading(false); return; }
    setLoading(true);
    try {
      const rows = await window.PfEvidence.listForReview();
      // RLS กรองให้แล้ว: teacher เห็นเฉพาะที่ถูก assign / admin เห็นทั้งหมด
      // เรากรองเฉพาะที่ยังไม่ approved/revise (= ยังต้องตรวจ)
      setList((rows || []).filter(r => r.status === "pending").map(mapRow));
    } catch (e) { toast("โหลดรายการตรวจไม่สำเร็จ: " + (e.message||e)); }
    finally { setLoading(false); }
  }, [backend, toast]);
  React.useEffect(() => { load(); }, [load]);

  const startReview = (r) => {
    setEval_({ score: 4, status: "approve", comment: "", levels: {} });
    setOpen(r);
  };
  const submitEval = async () => {
    if (!open) return;
    const label = eval_.status === "approve" ? "ผ่าน" : eval_.status === "revise" ? "ต้องปรับปรุง" : "ไม่ผ่าน";
    const levelName = LEVEL_NAMES[Math.round(eval_.score)-1]?.label || "";
    if (!backend) {
      toast(`บันทึกการประเมิน (demo): ${label} — ระดับ ${levelName} (${eval_.score}/5)`);
      setList(l => l.filter(x => x.id !== open.id));
      setOpen(null);
      return;
    }
    setBusy(true);
    try {
      await window.PfEvaluations.save({
        evidenceId: open.id,
        studentId: open.dbRow.student_id,
        evaluatorId: window.pfCurrentUser.id,
        score: eval_.score,
        status: eval_.status,
        comment: eval_.comment,
        subLevels: eval_.levels,
      });
      toast(`บันทึกการประเมิน: ${label} — ${levelName} (${eval_.score}/5)`);
      setOpen(null);
      await load();
    } catch (e) {
      toast("บันทึกไม่สำเร็จ: " + (e.message || e));
    } finally { setBusy(false); }
  };
  const setLevel = (comp, v) => setEval_(e => ({ ...e, levels: { ...e.levels, [comp]: v }}));

  const filtered = list.filter(r => filter === "all" || r.urgency === filter);

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>รายการที่ต้องตรวจ</h2>
          <div className="muted small">รายการหลักฐานที่นักเรียนส่งมารอการประเมิน</div>
        </div>
        <div className="filterbar">
          <select className="select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">ความสำคัญทั้งหมด</option>
            <option value="red">เร่งด่วน</option>
            <option value="amber">ปานกลาง</option>
            <option value="blue">ปกติ</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card muted" style={{textAlign:"center", padding:40}}>กำลังโหลด…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{textAlign:"center", padding:60}}>
          <div style={{fontSize:36}}>🎉</div>
          <h3 className="mt-3">เคลียร์รายการครบแล้ว</h3>
          <div className="muted">ยังไม่มีหลักฐานที่รอการประเมินจากนักเรียนที่คุณรับผิดชอบ</div>
        </div>
      ) : null}

      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {filtered.map(r => (
          <div className="item" key={r.id}>
            <Avatar emoji="👩‍🎓" size={48}/>
            <div className="body">
              <div className="row gap-2">
                <h3 style={{margin:0}}>{r.title}</h3>
                <Pill kind={r.urgency==="red"?"red":r.urgency==="amber"?"amber":"blue"}>
                  {r.urgency==="red"?"เร่งด่วน":r.urgency==="amber"?"ปานกลาง":"ปกติ"}
                </Pill>
              </div>
              <div className="muted small mt-2">โดย {r.student} ({r.studentId}) • {r.classroom} • ส่ง {r.sub}</div>
              <p className="muted" style={{margin:"6px 0 4px"}}>{r.desc}</p>
              <div className="tags">
                {r.comps.map((c,i)=> <Pill key={i} kind="blue">{c}</Pill>)}
              </div>
              <div className="status-line">
                <span>📅 {r.date}</span>
                {r.driveLinks && r.driveLinks.filter(Boolean).length > 0 && (
                  <span>📎 {r.driveLinks.filter(Boolean).length} ลิงก์ Drive</span>
                )}
              </div>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <button className="btn btn-primary btn-sm" onClick={()=>startReview(r)}>ตรวจประเมิน</button>
              <button className="btn btn-ghost btn-sm">ดูไฟล์</button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal title={`ประเมิน: ${open.title}`} onClose={()=>setOpen(null)} width={760}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setOpen(null)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={submitEval} disabled={busy}>{busy?"กำลังบันทึก…":"บันทึกการประเมิน"}</button>
          </>}>
          <div className="muted small">โดย {open.student} ({open.studentId}) • {open.classroom}</div>
          <p className="mt-2">{open.desc}</p>

          {open.driveLinks && open.driveLinks.filter(Boolean).length > 0 && (
            <>
              <div className="divider-h"></div>
              <div className="small muted" style={{marginBottom:10}}>📎 หลักฐานที่นักเรียนแนบ ({open.driveLinks.filter(Boolean).length})</div>
              <DrivePreviewGrid items={open.driveLinks.filter(Boolean)}/>
            </>
          )}

          <div className="divider-h"></div>
          <div style={{fontWeight:600, marginBottom:8}}>ระดับสมรรถนะที่ปรากฏ (1–5)</div>
          <div className="muted small" style={{marginBottom:10}}>
            {LEVEL_NAMES.map(l => <span key={l.n} style={{marginRight:12}}><b style={{color:l.color}}>{l.short}</b> {l.label}</span>)}
          </div>
          {open.comps.map((c) => (
            <div key={c} className="row-between" style={{padding:"6px 0"}}>
              <span>{c}</span>
              <div className="row gap-2">
                {[1,2,3,4,5].map(v => (
                  <button key={v}
                    onClick={()=>setLevel(c, v)}
                    className="btn btn-sm"
                    title={LEVEL_NAMES[v-1].label}
                    style={{
                      background: eval_.levels[c] === v ? LEVEL_NAMES[v-1].color : "#fff",
                      color: eval_.levels[c] === v ? "#fff" : "var(--ink)",
                      border:"1px solid var(--line)", padding:"4px 12px", minWidth:36
                    }}>{v}</button>
                ))}
              </div>
            </div>
          ))}

          <div className="divider-h"></div>
          <div className="field">
            <label>คะแนนรวม (1–5) — <b style={{color: LEVEL_NAMES[Math.round(eval_.score)-1].color}}>{LEVEL_NAMES[Math.round(eval_.score)-1].label}</b></label>
            <div className="row gap-3" style={{alignItems:"center"}}>
              <input type="range" min="1" max="5" step="0.1"
                value={eval_.score}
                onChange={e=>setEval_(s=>({...s, score: +e.target.value}))}
                style={{flex:1}}/>
              <div className="mono" style={{minWidth:48, textAlign:"right", fontWeight:600}}>{eval_.score.toFixed(1)}</div>
            </div>
          </div>

          <div className="field">
            <label>ผลการประเมิน</label>
            <div className="row gap-2">
              {[
                {k:"approve", l:"✅ ผ่าน", kind:"btn-teal"},
                {k:"revise",  l:"🔁 ต้องปรับปรุง", kind:"btn-purple"},
                {k:"reject",  l:"✖ ไม่ผ่าน", kind:"btn-danger"},
              ].map(o => (
                <button key={o.k}
                  className={`btn ${eval_.status===o.k ? o.kind : "btn-ghost"}`}
                  onClick={()=>setEval_(s=>({...s, status:o.k}))}>{o.l}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>ความเห็น / ข้อเสนอแนะ</label>
            <textarea className="textarea" placeholder="เขียนข้อเสนอแนะที่ช่วยให้นักเรียนพัฒนาต่อได้ เช่น จุดแข็ง สิ่งที่ควรปรับปรุง และตัวอย่างที่ดี"
              value={eval_.comment} onChange={e=>setEval_(s=>({...s, comment:e.target.value}))}/>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- My Students ---------- */
function TeacherStudents({ toast }) {
  const backend = !!(window.PfUsers && window.PF_SUPABASE_READY);
  const [q, setQ] = React.useState("");
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(backend);
  const [openOf, setOpenOf] = React.useState(null);
  const [levels, setLevels] = React.useState({});
  const [loadingLevels, setLoadingLevels] = React.useState(false);

  React.useEffect(() => {
    if (!backend) return;
    (async () => {
      try {
        const all = await window.PfUsers.list();
        setStudents((all || []).filter(u => u.role === "student"));
      } catch (e) { toast("โหลดรายชื่อนักเรียนไม่สำเร็จ: " + (e.message||e)); }
      finally { setLoading(false); }
    })();
  }, [backend, toast]);

  const filtered = students.filter(s =>
    !q || (s.name||"").includes(q) || (s.student_code||"").includes(q) || (s.email||"").toLowerCase().includes(q.toLowerCase())
  );

  const openProfile = async (s) => {
    setOpenOf(s); setLevels({}); setLoadingLevels(true);
    try {
      const l = await window.computeMyLevels(s.id);
      setLevels(l || {});
    } catch (e) { /* ignore */ }
    finally { setLoadingLevels(false); }
  };

  const radarLabels = [
    ...CORE_COMPETENCIES.map(c => c.short),
    ...SPEC_COMPETENCIES.map(c => c.short),
  ];
  const radarValues = openOf ? [
    ...CORE_COMPETENCIES.map(c => levels[c.key] || 0),
    ...SPEC_COMPETENCIES.map(c => levels[c.key] || 0),
  ] : [];
  const evaluatedCount = openOf ? Object.values(levels).filter(v => v > 0).length : 0;

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>นักเรียนในระบบ</h2>
          <div className="muted small">ดูภาพรวมสมรรถนะของนักเรียนแต่ละคน</div>
        </div>
        <div className="filterbar">
          <input className="input" placeholder="ค้นหาด้วยชื่อ/รหัส/อีเมล" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr>
              <th style={{width:60}}></th>
              <th>นักเรียน</th>
              <th>รหัส</th>
              <th>ชั้น</th>
              <th>อีเมล</th>
              <th className="text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="muted" style={{padding:20,textAlign:"center"}}>กำลังโหลด…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{padding:30,textAlign:"center"}}>ไม่พบนักเรียน</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td><Avatar emoji="👤" size={32}/></td>
                <td><b>{s.name}</b></td>
                <td className="mono small">{s.student_code || "—"}</td>
                <td>{s.grade || "—"}</td>
                <td className="muted small">{s.email}</td>
                <td className="text-right">
                  <button className="btn btn-ghost btn-sm" onClick={()=>openProfile(s)}>ดูภาพรวมสมรรถนะ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openOf && (
        <Modal title={`ภาพรวมสมรรถนะ: ${openOf.name}`} onClose={()=>setOpenOf(null)} width={780}
          footer={<button className="btn btn-ghost" onClick={()=>setOpenOf(null)}>ปิด</button>}>
          <div className="muted small">
            {openOf.email}{openOf.student_code ? " • รหัส " + openOf.student_code : ""}{openOf.grade ? " • ชั้น " + openOf.grade : ""}
          </div>
          <div className="divider-h"></div>
          {loadingLevels ? (
            <div className="muted" style={{padding:30,textAlign:"center"}}>กำลังคำนวณ…</div>
          ) : evaluatedCount === 0 ? (
            <div className="muted" style={{padding:30,textAlign:"center"}}>นักเรียนคนนี้ยังไม่มีหลักฐานที่ได้รับการประเมิน</div>
          ) : (
          <div className="two-col">
            <div>
              <h3 style={{marginTop:0}}>ระดับแต่ละสมรรถนะ</h3>
              <div className="muted small" style={{marginBottom:6}}>สมรรถนะหลัก</div>
              {CORE_COMPETENCIES.map(c => {
                const lvl = levels[c.key] || 0;
                return (
                  <div key={c.key} className="comp-row">
                    <div className="lbl"><span>{c.short}</span><span className="muted">{lvl > 0 ? `${LEVEL_NAMES[lvl-1].label} (${lvl}/5)` : "—"}</span></div>
                    <ProgressBar value={lvl} max={5}/>
                  </div>
                );
              })}
              <div className="muted small mt-3" style={{marginBottom:6}}>สมรรถนะเฉพาะ</div>
              {SPEC_COMPETENCIES.map(c => {
                const lvl = levels[c.key] || 0;
                return (
                  <div key={c.key} className="comp-row">
                    <div className="lbl"><span>{c.short}</span><span className="muted">{lvl > 0 ? `${LEVEL_NAMES[lvl-1].label} (${lvl}/5)` : "—"}</span></div>
                    <ProgressBar value={lvl} max={5}/>
                  </div>
                );
              })}
            </div>
            <div>
              <h3 style={{marginTop:0}}>ภาพรวม</h3>
              <RadarChart labels={radarLabels} values={radarValues} max={5} size={340}/>
            </div>
          </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------- History ---------- */
function TeacherHistory() {
  return (
    <div className="page">
      <h2 style={{fontSize:22}}>ประวัติการประเมิน</h2>
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>วันที่</th><th>นักเรียน</th><th>ชิ้นงาน</th><th>คะแนน</th><th>สถานะ</th></tr></thead>
          <tbody>
            {HISTORY.map(h => (
              <tr key={h.id}>
                <td>{h.date}</td>
                <td>{h.student}</td>
                <td>{h.title}</td>
                <td className="mono">{h.score.toFixed(1)}/5</td>
                <td>
                  {h.status === "ผ่าน" ? <Pill kind="green">✅ ผ่าน</Pill> :
                   h.status === "ต้องปรับปรุง" ? <Pill kind="purple">🔁 ต้องปรับปรุง</Pill> :
                   <Pill kind="red">✖ ไม่ผ่าน</Pill>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Announcements ---------- */
function TeacherAnnounce({ toast }) {
  const [posts, setPosts] = React.useState([]);
  const [form, setForm] = React.useState({ title:"", body:"", to:"ม.5/2" });
  const post = (e) => {
    e.preventDefault();
    if (!form.title || !form.body) { toast("กรอกหัวข้อและรายละเอียด"); return; }
    setPosts(p => [{ id:"n"+(p.length+10), ...form, date:"เพิ่งโพสต์" }, ...p]);
    setForm({ title:"", body:"", to:"ม.5/2" });
    toast("เผยแพร่ประกาศเรียบร้อย");
  };
  return (
    <div className="page">
      <h2 style={{fontSize:22}}>ประกาศและนัดหมาย</h2>
      <div className="card">
        <h3>เขียนประกาศใหม่</h3>
        <form onSubmit={post}>
          <div className="field"><label>หัวข้อ</label>
            <input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="เช่น แจ้งกำหนดส่งหลักฐาน"/></div>
          <div className="field"><label>ส่งถึง</label>
            <select className="select" value={form.to} onChange={e=>setForm(f=>({...f,to:e.target.value}))}>
              <option>ม.5/2</option><option>ม.6/1</option><option>ทุกห้องในที่ปรึกษา</option>
            </select></div>
          <div className="field"><label>รายละเอียด</label>
            <textarea className="textarea" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="เนื้อหาประกาศ"/></div>
          <button className="btn btn-primary">เผยแพร่ประกาศ</button>
        </form>
      </div>

      <h3 className="mt-6">ประกาศล่าสุด</h3>
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        {posts.map(p => (
          <div className="card card-tight" key={p.id} style={{padding:16}}>
            <div className="row-between">
              <div style={{fontWeight:600}}>{p.title}</div>
              <Pill kind="gray">{p.to}</Pill>
            </div>
            <div className="muted small mt-2">{p.body}</div>
            <div className="muted small mt-2">📅 {p.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Teacher Profile ---------- */
function TeacherProfile({ toast, onLogout }) {
  const cur = window.pfCurrentUser || {};
  const [u, setU] = React.useState({
    staffId: cur.id || "", name: cur.name || "", dept: cur.dept || "",
    email: cur.email || "", phone: "", classes: "",
  });
  const upd = (k, v) => setU(s => ({ ...s, [k]: v }));
  return (
    <div className="page">
      <h2 style={{fontSize:22}}>โปรไฟล์ของฉัน</h2>
      <div className="profile-grid">
        <div className="card profile-card">
          <div className="avatar-lg" style={{background:"linear-gradient(135deg,#22d3ee,#3b82f6)"}}>👨‍🏫</div>
          <h2>{u.name}</h2>
          <div className="role">อาจารย์ผู้ประเมิน · {u.dept}</div>

          <div className="field mt-5" style={{textAlign:"left"}}><label>รหัสบุคลากร</label><input className="input" value={u.staffId} onChange={e=>upd("staffId", e.target.value)}/></div>
          <div className="field" style={{textAlign:"left"}}><label>กลุ่มสาระ</label><input className="input" value={u.dept} onChange={e=>upd("dept", e.target.value)}/></div>
          <div className="field" style={{textAlign:"left"}}><label>อีเมล</label><input className="input" value={u.email} onChange={e=>upd("email", e.target.value)}/></div>
          <div className="field" style={{textAlign:"left"}}><label>เบอร์โทรศัพท์</label><input className="input" value={u.phone} onChange={e=>upd("phone", e.target.value)}/></div>
          <div className="field" style={{textAlign:"left"}}><label>ห้องที่ปรึกษา</label><input className="input" value={u.classes} onChange={e=>upd("classes", e.target.value)}/></div>
          <button className="btn btn-primary btn-block" onClick={()=>toast("บันทึกข้อมูลเรียบร้อย")}>บันทึกการเปลี่ยนแปลง</button>
          <button className="btn btn-danger btn-block mt-3" onClick={onLogout}>ออกจากระบบ</button>
        </div>

        <div>
          <div className="card">
            <h3>สถิติการประเมิน</h3>
            <div className="stat-grid">
              <div className="stat stat-blue"><div className="num">—</div><div className="lbl">ประเมินแล้วเทอมนี้</div></div>
              <div className="stat stat-amber"><div className="num">—</div><div className="lbl">รอประเมิน</div></div>
              <div className="stat stat-green"><div className="num">—</div><div className="lbl">นักเรียนในที่ปรึกษา</div></div>
              <div className="stat stat-purple"><div className="num">—</div><div className="lbl">คะแนนเฉลี่ยที่ให้</div></div>
            </div>
          </div>
          <div className="card mt-4">
            <h3>การตั้งค่าการประเมิน</h3>
            <div className="checkbox-row"><input type="checkbox" defaultChecked/><span>แจ้งเตือนเมื่อมีหลักฐานใหม่</span></div>
            <div className="checkbox-row"><input type="checkbox" defaultChecked/><span>สรุปรายสัปดาห์ทางอีเมล</span></div>
            <div className="checkbox-row"><input type="checkbox"/><span>อนุญาตให้นักเรียนนัดออนไลน์</span></div>
          </div>
          <ChangePasswordCard toast={toast}/>
        </div>
      </div>
    </div>
  );
}

window.TEACHER_NAV = TEACHER_NAV;
Object.assign(window, {
  TeacherHome, TeacherReview, TeacherStudents, TeacherHistory, TeacherAnnounce, TeacherProfile,
});

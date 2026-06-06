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

const TEACHER_SELF = {
  staffId: "T-0238",
  name: "อ.ดร.สมชาย ใจดี",
  dept: "กลุ่มสาระวิทยาศาสตร์สุขภาพ",
  email: "somchai@swu.ac.th",
  phone: "081-555-0238",
  classes: "ม.5/2, ม.6/1",
};

const REVIEW_QUEUE = [
  {
    id: "r1", student: "สุดา ใจดี", studentId: "65001234", classroom: "ม.5/2",
    title: "การนำเสนอหน้าชั้นเรียน: ระบบหายใจของมนุษย์",
    desc: "การนำเสนอแบบกลุ่มเกี่ยวกับโครงสร้างและหน้าที่ของระบบหายใจ",
    date: "12 ต.ค. 2567", sub: "2 วันที่แล้ว",
    comps: ["การสื่อสาร", "การรวมพลังทำงานเป็นทีม", "เข้าอกเข้าใจผู้อื่น"],
    files: ["presentation.pdf", "recording.mp4"],
    driveLinks: [
      parseDriveLink("https://docs.google.com/presentation/d/T1A2B3C4D5E6F7G8H9I0JKLMNOPqrstu/edit"),
      parseDriveLink("https://drive.google.com/file/d/T2X3Y4Z5A6B7C8D9E0FGHIJKLMNOPqrst/view"),
    ],
    urgency: "amber",
  },
  {
    id: "r2", student: "ภัทรพล วิทยา", studentId: "65001235", classroom: "ม.5/2",
    title: "บทสะท้อนการเรียนรู้: การเรียนวิชาชีววิทยา",
    desc: "การสะท้อนคิดเกี่ยวกับการเรียนวิชาชีววิทยาในเทอมนี้",
    date: "10 ต.ค. 2567", sub: "4 วันที่แล้ว",
    comps: ["การจัดการตนเอง", "ยืดหยุ่นและปรับตัว"],
    files: ["reflection.docx"],
    driveLinks: [
      parseDriveLink("https://docs.google.com/document/d/T3F4G5H6I7J8K9L0M1NOPQRSTUVwxyz/edit"),
    ],
    urgency: "red",
  },
  {
    id: "r3", student: "ณัฐวดี สมบัติ", studentId: "65001241", classroom: "ม.5/2",
    title: "โครงงาน: สำรวจคุณภาพอากาศในโรงเรียน",
    desc: "งานสำรวจคุณภาพอากาศและฝุ่น PM2.5 รอบโรงเรียน 2 สัปดาห์",
    date: "14 ต.ค. 2567", sub: "เมื่อวานนี้",
    comps: ["ใฝ่รู้และสืบเสาะหาความรู้", "การคิดขั้นสูง", "อยู่ร่วมกับธรรมชาติและวิทยาการ"],
    files: ["project.pdf", "data.xlsx"],
    driveLinks: [
      parseDriveLink("https://drive.google.com/file/d/T4G5H6I7J8K9L0M1N2OPQRSTUVwxyz12/view"),
      parseDriveLink("https://docs.google.com/spreadsheets/d/T5H6I7J8K9L0M1N2O3PQRSTUVwxyzab/edit"),
    ],
    urgency: "blue",
  },
  {
    id: "r4", student: "ปวีณา ขยันดี", studentId: "65001242", classroom: "ม.6/1",
    title: "ค่ายอาสาดูแลผู้สูงอายุ",
    desc: "บันทึกการเข้าร่วมค่าย 3 วัน 2 คืน และบทสะท้อนสิ่งที่ได้เรียนรู้",
    date: "9 ต.ค. 2567", sub: "5 วันที่แล้ว",
    comps: ["การเป็นพลเมืองที่เข้มแข็ง","การเข้าอกเข้าใจผู้อื่น","มีจริยธรรมและความรับผิดชอบ"],
    files: ["report.pdf", "photos.zip"],
    urgency: "amber",
  },
];

const MY_STUDENTS = [
  { id: "65001234", name: "สุดา ใจดี",         room:"ม.5/2", count: 15, avg: 3.8, pend: 1, last:"2 วัน" },
  { id: "65001235", name: "ภัทรพล วิทยา",     room:"ม.5/2", count: 12, avg: 3.4, pend: 2, last:"4 วัน" },
  { id: "65001241", name: "ณัฐวดี สมบัติ",     room:"ม.5/2", count: 18, avg: 4.1, pend: 1, last:"1 วัน" },
  { id: "65001244", name: "ธนพร แก้วใส",     room:"ม.5/2", count: 9,  avg: 3.0, pend: 0, last:"1 สัปดาห์" },
  { id: "65001247", name: "กิตติพงศ์ พิทักษ์", room:"ม.5/2", count: 14, avg: 3.6, pend: 0, last:"3 วัน" },
  { id: "65001242", name: "ปวีณา ขยันดี",     room:"ม.6/1", count: 21, avg: 4.4, pend: 1, last:"5 วัน" },
  { id: "65001245", name: "อนุชา สงบ",       room:"ม.6/1", count: 11, avg: 3.2, pend: 0, last:"2 สัปดาห์" },
];

const HISTORY = [
  { id:"h1", date:"10 ต.ค. 2567", student:"สุดา ใจดี", title:"โครงงานวิจัยสมุนไพรไทย", score:4.5, status:"ผ่าน" },
  { id:"h2", date:"8 ต.ค. 2567", student:"ภัทรพล วิทยา", title:"การทดลองในห้องปฏิบัติการ", score:3.5, status:"ผ่าน" },
  { id:"h3", date:"5 ต.ค. 2567", student:"ธนพร แก้วใส", title:"บทสะท้อนการเรียน", score:2.5, status:"ต้องปรับปรุง" },
  { id:"h4", date:"3 ต.ค. 2567", student:"ณัฐวดี สมบัติ", title:"การนำเสนอประเด็นสุขภาพ", score:4.0, status:"ผ่าน" },
  { id:"h5", date:"1 ต.ค. 2567", student:"กิตติพงศ์ พิทักษ์", title:"โปสเตอร์รณรงค์", score:3.8, status:"ผ่าน" },
];

/* ---------- Teacher Home / Dashboard ---------- */
function TeacherHome({ go }) {
  return (
    <div className="page">
      <div className="hero">
        <Avatar emoji="👨‍🏫" size={64} gradient="linear-gradient(135deg,#22d3ee,#3b82f6)"/>
        <div>
          <h1>สวัสดี {TEACHER_SELF.name}</h1>
          <p>{TEACHER_SELF.dept} • ที่ปรึกษาห้อง {TEACHER_SELF.classes}</p>
          <a>คุณมีหลักฐานรอตรวจ 4 รายการ และนัดหมายให้คำปรึกษา 2 ครั้งสัปดาห์นี้</a>
        </div>
      </div>

      <div className="stat-grid mt-5" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <div className="stat stat-blue"><div className="num">42</div><div className="lbl">นักเรียนในที่ปรึกษา</div></div>
        <div className="stat stat-amber"><div className="num">4</div><div className="lbl">หลักฐานรอตรวจ</div></div>
        <div className="stat stat-green"><div className="num">128</div><div className="lbl">ประเมินแล้ว (เทอมนี้)</div></div>
        <div className="stat stat-purple"><div className="num">3.7</div><div className="lbl">คะแนนเฉลี่ยห้อง</div></div>
      </div>

      <div className="two-col mt-5">
        <div className="card">
          <div className="row-between"><h2 className="mb-0">รายการรอตรวจ (ด่วน)</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>go("t-review")}>ดูทั้งหมด →</button>
          </div>
          <div className="mt-3" style={{display:"flex", flexDirection:"column", gap:10}}>
            {REVIEW_QUEUE.slice(0,3).map(r => (
              <div key={r.id} className="card card-tight" style={{padding:14, border:"1px solid var(--line)"}}>
                <div className="row-between">
                  <div>
                    <div style={{fontWeight:600}}>{r.title}</div>
                    <div className="small muted">โดย {r.student} • ส่งเมื่อ {r.sub}</div>
                  </div>
                  <Pill kind={r.urgency==="red"?"red":r.urgency==="amber"?"amber":"blue"}>
                    {r.urgency==="red"?"เร่งด่วน":r.urgency==="amber"?"ปานกลาง":"ปกติ"}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>ภาพรวมสมรรถนะของห้อง ม.5/2</h2>
          <div className="radar-wrap">
            <RadarChart
              labels={["จัดการตนเอง","คิดขั้นสูง","สื่อสาร","ทีม","พลเมือง","ธรรมชาติ","ใฝ่รู้","เข้าอกเข้าใจ","จริยธรรม","ยืดหยุ่น"]}
              values={[3.6, 3.2, 3.9, 3.7, 3.4, 3.1, 4.1, 3.8, 3.5, 3.3]}
              max={5} size={380}/>
          </div>
        </div>
      </div>

      <div className="card mt-5">
        <h2>นัดหมายให้คำปรึกษา (สัปดาห์นี้)</h2>
        <table className="table">
          <thead><tr><th>วันที่</th><th>เวลา</th><th>นักเรียน</th><th>หัวข้อ</th><th></th></tr></thead>
          <tbody>
            <tr><td>จ. 18 พ.ย. 2567</td><td className="num">14:00</td><td>สุดา ใจดี</td><td>ปรึกษาโครงงานสมุนไพร</td><td className="text-right"><button className="btn btn-ghost btn-sm">เลื่อน</button></td></tr>
            <tr><td>พ. 20 พ.ย. 2567</td><td className="num">10:30</td><td>ธนพร แก้วใส</td><td>ทบทวนบทสะท้อน</td><td className="text-right"><button className="btn btn-ghost btn-sm">เลื่อน</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Review Queue with eval modal ---------- */
function TeacherReview({ toast }) {
  const [list, setList] = React.useState(REVIEW_QUEUE);
  const [open, setOpen] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [eval_, setEval_] = React.useState({ score: 4, status: "approve", comment: "", levels: {} });

  const startReview = (r) => {
    setEval_({ score: 4, status: "approve", comment: "", levels: {} });
    setOpen(r);
  };
  const submitEval = () => {
    const label = eval_.status === "approve" ? "ผ่าน" : eval_.status === "revise" ? "ต้องปรับปรุง" : "ไม่ผ่าน";
    const levelName = LEVEL_NAMES[Math.round(eval_.score)-1]?.label || "";
    toast(`บันทึกการประเมิน: ${label} — ระดับ ${levelName} (${eval_.score}/5)`);
    setList(l => l.filter(x => x.id !== open.id));
    setOpen(null);
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

      {filtered.length === 0 && (
        <div className="card" style={{textAlign:"center", padding:60}}>
          <div style={{fontSize:36}}>🎉</div>
          <h3 className="mt-3">เคลียร์รายการครบแล้ว</h3>
          <div className="muted">ยังไม่มีหลักฐานใหม่ที่รอการประเมิน</div>
        </div>
      )}

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
                <span>📁 {r.files.join(", ")}</span>
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
            <button className="btn btn-primary" onClick={submitEval}>บันทึกการประเมิน</button>
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
  const [q, setQ] = React.useState("");
  const [room, setRoom] = React.useState("all");
  const filtered = MY_STUDENTS.filter(s =>
    (room === "all" || s.room === room) &&
    (!q || s.name.includes(q) || s.id.includes(q))
  );
  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:18}}>
        <h2 className="mb-0" style={{fontSize:22}}>นักเรียนในที่ปรึกษา</h2>
        <div className="filterbar">
          <input className="input" placeholder="ค้นหาด้วยชื่อหรือรหัส" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="select" value={room} onChange={e=>setRoom(e.target.value)}>
            <option value="all">ทุกห้อง</option>
            <option>ม.5/2</option>
            <option>ม.6/1</option>
          </select>
          <button className="btn btn-soft btn-sm" onClick={()=>toast("ส่งออกรายชื่อ (CSV)")}>ส่งออก CSV</button>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr>
              <th style={{width:60}}></th>
              <th>นักเรียน</th>
              <th>ห้อง</th>
              <th>หลักฐาน</th>
              <th>คะแนนเฉลี่ย</th>
              <th>รอตรวจ</th>
              <th>ส่งล่าสุด</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td><Avatar emoji="👤" size={32}/></td>
                <td><b>{s.name}</b><div className="small muted mono">{s.id}</div></td>
                <td>{s.room}</td>
                <td className="num">{s.count}</td>
                <td>
                  <div className="row gap-2"><span className="mono">{s.avg}</span>
                    <div className="meter" style={{width:80}}><span style={{width:(s.avg/5*100)+"%"}}></span></div>
                  </div>
                </td>
                <td>{s.pend > 0 ? <Pill kind="amber">{s.pend}</Pill> : <span className="muted">—</span>}</td>
                <td className="muted">{s.last}</td>
                <td className="text-right"><button className="btn btn-ghost btn-sm" onClick={()=>toast(`เปิดโปรไฟล์ของ ${s.name}`)}>ดูโปรไฟล์</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  const [posts, setPosts] = React.useState([
    { id:"n1", title:"กำหนดส่งโครงงานปลายภาค", body:"นักเรียนทุกคนกรุณาส่งหลักฐานโครงงานก่อนวันที่ 30 พ.ย. 2567", date:"2 วันที่แล้ว", to:"ม.5/2" },
    { id:"n2", title:"ปรึกษากลุ่ม ส.พ. 24", body:"พบกันที่ห้อง 405 เวลา 13:00 เพื่อทบทวนแผนการศึกษา", date:"5 วันที่แล้ว", to:"ม.5/2" },
  ]);
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
  const [u, setU] = React.useState(TEACHER_SELF);
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
              <div className="stat stat-blue"><div className="num">128</div><div className="lbl">ประเมินแล้วเทอมนี้</div></div>
              <div className="stat stat-amber"><div className="num">4</div><div className="lbl">รอประเมิน</div></div>
              <div className="stat stat-green"><div className="num">42</div><div className="lbl">นักเรียนในที่ปรึกษา</div></div>
              <div className="stat stat-purple"><div className="num">3.7</div><div className="lbl">คะแนนเฉลี่ยที่ให้</div></div>
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

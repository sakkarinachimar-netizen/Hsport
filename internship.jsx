/* internship.jsx — Internship (ฝึกงาน) system: Student / Teacher / Admin views */

/* ---------- Data ---------- */
const INTERNSHIP_SITES = [
  { id: "s1", name: "โรงพยาบาลจุฬาลงกรณ์", dept: "แผนกพยาธิวิทยา", area: "กรุงเทพฯ",
    field: "การแพทย์", cap: 4, taken: 2,
    desc: "ฝึกในห้องปฏิบัติการพยาธิวิทยา เรียนรู้การตรวจชิ้นเนื้อ การย้อมสี การวิเคราะห์เซลล์",
    skills: ["ใฝ่รู้และสืบเสาะ","การคิดขั้นสูง"], tag:"hospital", status:"open" },
  { id: "s2", name: "โรงพยาบาลศิริราช", dept: "แผนกเภสัชกรรม", area: "กรุงเทพฯ",
    field: "เภสัชกรรม", cap: 3, taken: 1,
    desc: "เรียนรู้กระบวนการจ่ายยา การให้คำปรึกษาผู้ป่วย ระบบเฝ้าระวังอาการไม่พึงประสงค์",
    skills: ["การเข้าอกเข้าใจผู้อื่น","จริยธรรมและความรับผิดชอบ"], tag:"hospital", status:"open" },
  { id: "s3", name: "ศูนย์วิทยาศาสตร์การแพทย์ที่ 1", dept: "ห้องปฏิบัติการอณูชีววิทยา", area: "นนทบุรี",
    field: "ห้องปฏิบัติการ", cap: 6, taken: 6,
    desc: "เทคนิคทางอณูชีววิทยา PCR sequencing การวิเคราะห์เชิงโมเลกุลของเชื้อก่อโรค",
    skills: ["ใฝ่รู้และสืบเสาะ","การคิดขั้นสูง"], tag:"lab", status:"full" },
  { id: "s4", name: "ห้องปฏิบัติการชีวเคมี คณะวิทยาศาสตร์ จุฬาฯ", dept: "ภาควิชาชีวเคมี", area: "กรุงเทพฯ",
    field: "ห้องปฏิบัติการ", cap: 4, taken: 1,
    desc: "ฝึกเทคนิคโครมาโทกราฟี เอนไซม์แอสเซย์ การทำงานในห้องวิจัยจริง",
    skills: ["ใฝ่รู้และสืบเสาะ","ยืดหยุ่นและปรับตัว"], tag:"lab", status:"open" },
  { id: "s5", name: "กรมวิทยาศาสตร์การแพทย์", dept: "สำนักคุ้มครองผู้บริโภค", area: "นนทบุรี",
    field: "สาธารณสุข", cap: 3, taken: 0,
    desc: "การตรวจวิเคราะห์คุณภาพผลิตภัณฑ์สุขภาพ การประกันคุณภาพห้องปฏิบัติการ",
    skills: ["จริยธรรมและความรับผิดชอบ","การคิดขั้นสูง"], tag:"gov", status:"open" },
  { id: "s6", name: "โรงพยาบาลรามาธิบดี", dept: "งานบริการพยาธิวิทยาคลินิก", area: "กรุงเทพฯ",
    field: "การแพทย์", cap: 4, taken: 3,
    desc: "ฝึกการตรวจเลือด ปัสสาวะ เคมีคลินิก จุลชีววิทยาคลินิก",
    skills: ["การคิดขั้นสูง","ใฝ่รู้และสืบเสาะ"], tag:"hospital", status:"open" },
  { id: "s7", name: "ห้องปฏิบัติการชีวโมเลกุล มศว", dept: "คณะแพทยศาสตร์", area: "กรุงเทพฯ",
    field: "ห้องปฏิบัติการ", cap: 5, taken: 2,
    desc: "เทคนิคปฏิบัติการในงานวิจัยทางการแพทย์ การออกแบบและรันการทดลอง",
    skills: ["ใฝ่รู้และสืบเสาะ","ยืดหยุ่นและปรับตัว"], tag:"lab", status:"open" },
  { id: "s8", name: "ศูนย์การแพทย์สมเด็จพระเทพรัตน์", dept: "งานเวชสารสนเทศ", area: "กรุงเทพฯ",
    field: "การแพทย์", cap: 2, taken: 0,
    desc: "ระบบข้อมูลสุขภาพ การจัดเก็บข้อมูลผู้ป่วย ระบบ HIS",
    skills: ["จริยธรรมและความรับผิดชอบ","การจัดการตนเอง"], tag:"hospital", status:"open" },
];

const INTERNSHIP_PERIODS = [
  { id: "p1", name: "ฤดูร้อน 2568",       start:"2568-03-15", end:"2568-04-12", weeks: 4,
    timeStart: "08:30", timeEnd: "16:30", days: "จ.–ศ.", hoursPerDay: 8,
    label:"ภาคฤดูร้อน (มี.ค.–เม.ย. 2568)", open:true },
  { id: "p2", name: "ปิดเทอม 1 ปี 2568",   start:"2568-10-06", end:"2568-10-20", weeks: 2,
    timeStart: "09:00", timeEnd: "16:00", days: "จ.–ศ.", hoursPerDay: 7,
    label:"ปิดภาคเรียนที่ 1 (ต.ค. 2568)", open:true },
  { id: "p3", name: "ปิดเทอม 2 ปี 2568",   start:"2569-03-10", end:"2569-03-24", weeks: 2,
    timeStart: "09:00", timeEnd: "16:00", days: "จ.–ศ.", hoursPerDay: 7,
    label:"ปิดภาคเรียนที่ 2 (มี.ค. 2569)", open:false },
];

const INTERNSHIP_TAG_COLORS = { hospital:"red", lab:"blue", gov:"purple" };
const INTERNSHIP_TAG_LABELS = { hospital:"โรงพยาบาล", lab:"ห้องปฏิบัติการ", gov:"หน่วยงานรัฐ" };

/* Mock current applications (shared across views) */
const initialApps = [
  { id:"app1", studentId:"65001235", student:"ภัทรพล วิทยา",   siteId:"s1", periodId:"p1", status:"approved", advisor:"อ.สมชาย ใจดี", reflectionDone:false, evaluated:false },
  { id:"app2", studentId:"65001241", student:"ณัฐวดี สมบัติ",   siteId:"s4", periodId:"p1", status:"approved", advisor:"อ.สมชาย ใจดี", reflectionDone:true,  evaluated:false },
  { id:"app3", studentId:"65001247", student:"กิตติพงศ์ พิทักษ์",siteId:"s2", periodId:"p1", status:"pending",  advisor:"อ.สมชาย ใจดี", reflectionDone:false, evaluated:false },
  { id:"app4", studentId:"65001242", student:"ปวีณา ขยันดี",   siteId:"s6", periodId:"p2", status:"approved", advisor:"อ.สมชาย ใจดี", reflectionDone:true,  evaluated:true,  score:4.5 },
];

/* ---------- Student: Internship ---------- */
function StudentInternship({ toast }) {
  const [tab, setTab] = React.useState("browse");
  const [periodId, setPeriodId] = React.useState("p1");
  const [field, setField] = React.useState("all");
  const [open, setOpen] = React.useState(null);

  // My application (mock: student 65001234 has no app yet, can apply)
  const [myApp, setMyApp] = React.useState(null);

  const period = INTERNSHIP_PERIODS.find(p => p.id === periodId);
  const sites = INTERNSHIP_SITES.filter(s =>
    (field === "all" || s.field === field)
  );

  const apply = (site) => {
    if (site.status === "full") { toast("ที่นั่งเต็มแล้ว"); return; }
    setMyApp({
      siteId: site.id, periodId,
      status: "pending", appliedAt: new Date().toLocaleDateString("th-TH"),
    });
    setOpen(null);
    setTab("status");
    toast("ส่งคำขอฝึกงานเรียบร้อย รออาจารย์ที่ปรึกษาอนุมัติ");
  };
  const cancel = () => { setMyApp(null); toast("ยกเลิกคำขอแล้ว"); };

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:6}}>
        <h2 className="mb-0" style={{fontSize:22}}>ฝึกงานในสายวิทยาศาสตร์สุขภาพ</h2>
        {myApp && <Pill kind={myApp.status === "approved" ? "green" : myApp.status === "rejected" ? "red" : "amber"}>
          {myApp.status === "approved" ? "✓ ได้รับอนุมัติ" : myApp.status === "rejected" ? "✖ ไม่อนุมัติ" : "⌛ รออนุมัติ"}
        </Pill>}
      </div>
      <div className="muted small">เลือกสถานที่ฝึกประสบการณ์จริงที่หลักสูตรประสานไว้ พร้อมประเมินสมรรถนะหลังฝึก</div>

      <div className="tabs mt-4">
        <button className={tab==="browse"?"active":""} onClick={()=>setTab("browse")}>ค้นหาสถานที่</button>
        <button className={tab==="status"?"active":""} onClick={()=>setTab("status")}>คำขอของฉัน</button>
        <button className={tab==="periods"?"active":""} onClick={()=>setTab("periods")}>ช่วงเวลาฝึกงาน</button>
      </div>

      {tab === "browse" && (
        <>
          <div className="filterbar mb-0" style={{marginBottom:14}}>
            <select className="select" value={periodId} onChange={e=>setPeriodId(e.target.value)}>
              {INTERNSHIP_PERIODS.filter(p=>p.open).map(p => <option key={p.id} value={p.id}>{p.label} • {p.weeks} สัปดาห์ • {p.timeStart}–{p.timeEnd} น.</option>)}
            </select>
            <select className="select" value={field} onChange={e=>setField(e.target.value)}>
              <option value="all">ทุกสายงาน</option>
              <option>การแพทย์</option><option>เภสัชกรรม</option><option>ห้องปฏิบัติการ</option><option>สาธารณสุข</option>
            </select>
            <div className="spacer"></div>
            <span className="muted small">พบ {sites.length} สถานที่</span>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:14}}>
            {sites.map(s => {
              const isMine = myApp && myApp.siteId === s.id;
              return (
                <div key={s.id} className="card" style={{padding:18, display:"flex", flexDirection:"column"}}>
                  <div className="row-between" style={{gap:8, alignItems:"flex-start"}}>
                    <Pill kind={INTERNSHIP_TAG_COLORS[s.tag]}>{INTERNSHIP_TAG_LABELS[s.tag]}</Pill>
                    <span className="small muted">📍 {s.area}</span>
                  </div>
                  <h3 style={{margin:"10px 0 4px", fontSize:16}}>{s.name}</h3>
                  <div className="muted small">{s.dept}</div>
                  <p className="small" style={{margin:"10px 0"}}>{s.desc}</p>
                  <div className="row gap-2" style={{flexWrap:"wrap", marginBottom:10}}>
                    {s.skills.map((sk,i)=> <Pill key={i} kind="gray">{sk}</Pill>)}
                  </div>
                  <div className="row-between mt-2">
                    <div className="small">
                      <span className="muted">ที่นั่ง </span>
                      <b className="mono">{s.cap - s.taken}/{s.cap}</b>
                    </div>
                    {s.status === "full"
                      ? <Pill kind="red">เต็ม</Pill>
                      : isMine
                        ? <Pill kind="green">เลือกแล้ว</Pill>
                        : <button className="btn btn-primary btn-sm" onClick={()=>setOpen(s)} disabled={!!myApp}>
                            {myApp ? "เลือกแล้ว (อื่น)" : "เลือกสมัคร"}
                          </button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "status" && (
        myApp ? (
          (() => {
            const site = INTERNSHIP_SITES.find(s => s.id === myApp.siteId);
            const pd = INTERNSHIP_PERIODS.find(p => p.id === myApp.periodId);
            return (
              <div className="card" style={{padding:24}}>
                <div className="row-between" style={{flexWrap:"wrap", gap:8}}>
                  <div>
                    <h3 style={{marginBottom:4}}>{site.name}</h3>
                    <div className="muted small">{site.dept} • 📍 {site.area}</div>
                  </div>
                  <Pill kind={myApp.status === "approved" ? "green" : myApp.status === "rejected" ? "red" : "amber"}>
                    {myApp.status === "approved" ? "✓ ได้รับอนุมัติ" : myApp.status === "rejected" ? "✖ ไม่อนุมัติ" : "⌛ รออนุมัติจากอาจารย์ที่ปรึกษา"}
                  </Pill>
                </div>
                <div className="divider-h"></div>
                <div className="row gap-4" style={{flexWrap:"wrap"}}>
                  <div>
                    <div className="small muted">ช่วงเวลา</div>
                    <div><b>{pd.label}</b></div>
                    <div className="small mono muted">{pd.start} – {pd.end} ({pd.weeks} สัปดาห์)</div>
                  </div>
                  <div>
                    <div className="small muted">เวลาปฏิบัติงาน</div>
                    <div><b className="mono">{pd.timeStart}–{pd.timeEnd} น.</b></div>
                    <div className="small muted">{pd.days} • {pd.hoursPerDay} ชม./วัน</div>
                  </div>
                  <div>
                    <div className="small muted">วันที่ส่งคำขอ</div>
                    <div><b>{myApp.appliedAt}</b></div>
                  </div>
                  <div>
                    <div className="small muted">อาจารย์ที่ปรึกษา</div>
                    <div><b>อ.สมชาย ใจดี</b></div>
                  </div>
                </div>
                <div className="divider-h"></div>
                <div className="row-between" style={{flexWrap:"wrap", gap:10}}>
                  <div className="muted small">หลังจบฝึกงานต้องส่งบันทึกสะท้อนคิดและรับการประเมินจากอาจารย์</div>
                  <div className="row gap-2">
                    <button className="btn btn-soft btn-sm" onClick={()=>toast("เปิดฟอร์มบันทึกสะท้อนคิด")}>📝 บันทึกสะท้อนคิด</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancel}>ยกเลิกคำขอ</button>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="card" style={{textAlign:"center", padding:60}}>
            <div style={{fontSize:36}}>🩺</div>
            <h3 className="mt-3">ยังไม่ได้สมัครฝึกงาน</h3>
            <div className="muted">กลับไปที่ <a href="#" onClick={e=>{e.preventDefault(); setTab("browse");}}>หน้าค้นหาสถานที่</a> เพื่อเลือกที่ฝึก</div>
          </div>
        )
      )}

      {tab === "periods" && (
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead><tr><th>ช่วงเวลา</th><th>ระยะเวลา</th><th>วันเริ่ม</th><th>วันสิ้นสุด</th><th>เวลาปฏิบัติงาน</th><th>สถานะ</th></tr></thead>
            <tbody>
              {INTERNSHIP_PERIODS.map(p => (
                <tr key={p.id}>
                  <td><b>{p.label}</b></td>
                  <td>{p.weeks} สัปดาห์</td>
                  <td className="mono">{p.start}</td>
                  <td className="mono">{p.end}</td>
                  <td className="mono">{p.timeStart}–{p.timeEnd} น. <span className="muted small">({p.days})</span></td>
                  <td>{p.open ? <Pill kind="green">เปิดรับสมัคร</Pill> : <Pill kind="gray">ปิด</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={open.name} onClose={()=>setOpen(null)} width={620}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setOpen(null)}>ปิด</button>
            <button className="btn btn-primary" onClick={()=>apply(open)}>ยืนยันสมัครฝึกงาน</button>
          </>}>
          <div className="muted small">{open.dept} • 📍 {open.area} • สายงาน {open.field}</div>
          <p className="mt-3">{open.desc}</p>
          <div className="divider-h"></div>
          <div className="small" style={{fontWeight:600, marginBottom:6}}>สมรรถนะที่จะได้พัฒนา</div>
          <div className="row gap-2" style={{flexWrap:"wrap"}}>
            {open.skills.map((sk,i)=> <Pill key={i} kind="blue">{sk}</Pill>)}
          </div>
          <div className="divider-h"></div>
          <div className="row gap-4" style={{flexWrap:"wrap"}}>
            <div><div className="small muted">ช่วงที่เลือก</div><b>{period.label}</b></div>
            <div><div className="small muted">เวลาปฏิบัติงาน</div><b className="mono">{period.timeStart}–{period.timeEnd} น.</b> <span className="small muted">({period.days})</span></div>
            <div><div className="small muted">ที่นั่งคงเหลือ</div><b className="mono">{open.cap - open.taken}/{open.cap}</b></div>
          </div>
          <div className="privacy mt-4">
            <div className="h">📌 หมายเหตุ</div>
            <div className="mt-2">เมื่อยืนยันแล้ว ระบบจะส่งคำขอให้อาจารย์ที่ปรึกษาอนุมัติก่อน จากนั้นหลักสูตรจะติดต่อประสานงานสถานที่ฝึกให้</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Teacher: Internship evaluation ---------- */
function TeacherInternship({ toast }) {
  const [apps, setApps] = React.useState(initialApps);
  const [tab, setTab] = React.useState("pending");
  const [open, setOpen] = React.useState(null);
  const [evalForm, setEvalForm] = React.useState({ score:4, comment:"", levels:{} });

  const approve = (id) => { setApps(a => a.map(x => x.id === id ? { ...x, status:"approved" } : x)); toast("อนุมัติคำขอแล้ว"); };
  const reject  = (id) => { setApps(a => a.map(x => x.id === id ? { ...x, status:"rejected" } : x)); toast("ปฏิเสธคำขอแล้ว"); };

  const startEval = (a) => {
    setEvalForm({ score: 4, comment: "", levels:{} });
    setOpen(a);
  };
  const submitEval = () => {
    setApps(a => a.map(x => x.id === open.id ? { ...x, evaluated:true, score: evalForm.score } : x));
    toast(`บันทึกการประเมินฝึกงาน: ${evalForm.score}/5 (${LEVEL_NAMES[Math.round(evalForm.score)-1].label})`);
    setOpen(null);
  };

  const pending  = apps.filter(a => a.status === "pending");
  const ongoing  = apps.filter(a => a.status === "approved" && !a.evaluated);
  const done     = apps.filter(a => a.evaluated);

  const list = tab === "pending" ? pending : tab === "ongoing" ? ongoing : done;

  return (
    <div className="page">
      <h2 style={{fontSize:22}}>การฝึกงานของนักเรียน</h2>
      <div className="muted small">อนุมัติคำขอ ติดตามความคืบหน้า และประเมินสมรรถนะหลังเสร็จสิ้นการฝึก</div>

      <div className="stat-grid mt-4" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="stat stat-amber"><div className="num">{pending.length}</div><div className="lbl">รออนุมัติ</div></div>
        <div className="stat stat-blue"><div className="num">{ongoing.length}</div><div className="lbl">กำลังฝึก / รอประเมิน</div></div>
        <div className="stat stat-green"><div className="num">{done.length}</div><div className="lbl">ประเมินเสร็จสิ้น</div></div>
      </div>

      <div className="tabs mt-4">
        <button className={tab==="pending"?"active":""} onClick={()=>setTab("pending")}>รออนุมัติ ({pending.length})</button>
        <button className={tab==="ongoing"?"active":""} onClick={()=>setTab("ongoing")}>รอประเมิน ({ongoing.length})</button>
        <button className={tab==="done"   ?"active":""} onClick={()=>setTab("done")}>เสร็จสิ้น ({done.length})</button>
      </div>

      {list.length === 0
        ? <div className="card" style={{textAlign:"center", padding:50}}>
            <div className="muted">ไม่มีรายการในหมวดนี้</div>
          </div>
        : <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {list.map(a => {
              const site = INTERNSHIP_SITES.find(s => s.id === a.siteId);
              const pd   = INTERNSHIP_PERIODS.find(p => p.id === a.periodId);
              return (
                <div className="item" key={a.id}>
                  <Avatar emoji="👩‍🎓" size={48}/>
                  <div className="body">
                    <h3 style={{margin:0}}>{a.student} <span className="mono small muted">({a.studentId})</span></h3>
                    <div className="muted small mt-2">
                      📍 {site.name} • {site.dept}
                    </div>
                    <div className="muted small mt-2">🗓 {pd.label} ({pd.weeks} สัปดาห์) • 🕐 {pd.timeStart}–{pd.timeEnd} น. ({pd.days})</div>
                    {a.reflectionDone && <Pill kind="teal">✓ ส่งบันทึกสะท้อนคิดแล้ว</Pill>}
                    {a.evaluated && <Pill kind="green">คะแนน {a.score}/5 — {LEVEL_NAMES[Math.round(a.score)-1].label}</Pill>}
                  </div>
                  <div className="row gap-2">
                    {a.status === "pending" && <>
                      <button className="btn btn-teal btn-sm" onClick={()=>approve(a.id)}>อนุมัติ</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>reject(a.id)}>ปฏิเสธ</button>
                    </>}
                    {a.status === "approved" && !a.evaluated && (
                      <button className="btn btn-primary btn-sm" onClick={()=>startEval(a)} disabled={!a.reflectionDone}>
                        {a.reflectionDone ? "ประเมินสมรรถนะ" : "รอบันทึกสะท้อนคิด"}
                      </button>
                    )}
                    {a.evaluated && <button className="btn btn-ghost btn-sm" onClick={()=>toast("ดูบันทึกการประเมิน")}>ดูรายงาน</button>}
                  </div>
                </div>
              );
            })}
          </div>}

      {open && (() => {
        const site = INTERNSHIP_SITES.find(s => s.id === open.siteId);
        return (
          <Modal title={`ประเมินการฝึกงาน: ${open.student}`} onClose={()=>setOpen(null)} width={720}
            footer={<>
              <button className="btn btn-ghost" onClick={()=>setOpen(null)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={submitEval}>บันทึกการประเมิน</button>
            </>}>
            <div className="muted small">📍 {site.name} • {site.dept}</div>

            <div className="divider-h"></div>
            <div style={{fontWeight:600, marginBottom:8}}>ประเมินสมรรถนะที่พัฒนา</div>
            <div className="muted small" style={{marginBottom:10}}>
              {LEVEL_NAMES.map(l => <span key={l.n} style={{marginRight:12}}><b style={{color:l.color}}>{l.short}</b> {l.label}</span>)}
            </div>
            {site.skills.map(c => (
              <div key={c} className="row-between" style={{padding:"6px 0"}}>
                <span>{c}</span>
                <div className="row gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v}
                      onClick={()=>setEvalForm(f=>({...f, levels:{...f.levels, [c]:v}}))}
                      className="btn btn-sm"
                      title={LEVEL_NAMES[v-1].label}
                      style={{
                        background: evalForm.levels[c] === v ? LEVEL_NAMES[v-1].color : "#fff",
                        color: evalForm.levels[c] === v ? "#fff" : "var(--ink)",
                        border:"1px solid var(--line)", padding:"4px 12px", minWidth:36
                      }}>{v}</button>
                  ))}
                </div>
              </div>
            ))}

            <div className="divider-h"></div>
            <div className="field">
              <label>คะแนนรวม (1–5) — <b style={{color: LEVEL_NAMES[Math.round(evalForm.score)-1].color}}>{LEVEL_NAMES[Math.round(evalForm.score)-1].label}</b></label>
              <div className="row gap-3" style={{alignItems:"center"}}>
                <input type="range" min="1" max="5" step="0.1"
                  value={evalForm.score}
                  onChange={e=>setEvalForm(s=>({...s, score: +e.target.value}))}
                  style={{flex:1}}/>
                <div className="mono" style={{minWidth:48, textAlign:"right", fontWeight:600}}>{evalForm.score.toFixed(1)}</div>
              </div>
            </div>

            <div className="field">
              <label>ความเห็นจากการประเมิน</label>
              <textarea className="textarea" placeholder="ข้อเสนอแนะจากการนิเทศ จุดแข็ง สิ่งที่ควรพัฒนาต่อ"
                value={evalForm.comment} onChange={e=>setEvalForm(s=>({...s, comment:e.target.value}))}/>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

/* ---------- Admin: Internship management ---------- */
function AdminInternship({ toast }) {
  const [tab, setTab] = React.useState("sites");
  const [sites, setSites] = React.useState(INTERNSHIP_SITES);
  const [periods, setPeriods] = React.useState(INTERNSHIP_PERIODS);
  const [siteForm, setSiteForm] = React.useState(null);
  const [periodForm, setPeriodForm] = React.useState(null);

  const newSite = () => setSiteForm({ id:"", name:"", dept:"", area:"", field:"การแพทย์", cap:3, taken:0, desc:"", skills:[], tag:"hospital", status:"open" });
  const editSite = (s) => setSiteForm({ ...s });
  const saveSite = () => {
    if (!siteForm.name) { toast("กรุณากรอกชื่อสถานที่"); return; }
    setSites(list => {
      const existing = list.find(x => x.id === siteForm.id);
      if (existing) return list.map(x => x.id === siteForm.id ? siteForm : x);
      return [{ ...siteForm, id: "s" + (list.length + 100) }, ...list];
    });
    setSiteForm(null);
    toast("บันทึกสถานที่ฝึกงานเรียบร้อย");
  };
  const removeSite = (id) => { setSites(s => s.filter(x => x.id !== id)); toast("ลบสถานที่แล้ว"); };
  const toggleSite = (id) => setSites(s => s.map(x => x.id === id ? { ...x, status: x.status === "open" ? "closed" : "open" } : x));

  const newPeriod = () => setPeriodForm({ id:"", name:"", label:"", start:"", end:"", weeks:2, timeStart:"09:00", timeEnd:"16:00", days:"จ.–ศ.", hoursPerDay:7, open:true });
  const editPeriod = (p) => setPeriodForm({ ...p });
  const savePeriod = () => {
    if (!periodForm.label || !periodForm.start) { toast("กรุณากรอกข้อมูลให้ครบ"); return; }
    setPeriods(list => {
      const existing = list.find(x => x.id === periodForm.id);
      if (existing) return list.map(x => x.id === periodForm.id ? periodForm : x);
      return [...list, { ...periodForm, id: "p" + (list.length + 100) }];
    });
    setPeriodForm(null);
    toast("บันทึกช่วงเวลาเรียบร้อย");
  };
  const removePeriod = (id) => { setPeriods(p => p.filter(x => x.id !== id)); toast("ลบช่วงเวลาแล้ว"); };

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>จัดการระบบฝึกงาน</h2>
          <div className="muted small">กำหนดสถานที่ฝึกประสบการณ์ จำนวนรับ และช่วงเวลาให้นักเรียนเลือกสมัคร</div>
        </div>
        {tab === "sites"
          ? <button className="btn btn-primary btn-sm" onClick={newSite}><Icons.plus/> เพิ่มสถานที่</button>
          : <button className="btn btn-primary btn-sm" onClick={newPeriod}><Icons.plus/> เพิ่มช่วงเวลา</button>}
      </div>

      <div className="tabs mt-4">
        <button className={tab==="sites"?"active":""} onClick={()=>setTab("sites")}>สถานที่ฝึกงาน ({sites.length})</button>
        <button className={tab==="periods"?"active":""} onClick={()=>setTab("periods")}>ช่วงเวลาฝึกงาน ({periods.length})</button>
        <button className={tab==="apps"?"active":""} onClick={()=>setTab("apps")}>คำขอของนักเรียน</button>
      </div>

      {tab === "sites" && (
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead><tr><th>สถานที่</th><th>สังกัด/แผนก</th><th>พื้นที่</th><th>สายงาน</th><th>ที่นั่ง</th><th>สถานะ</th><th></th></tr></thead>
            <tbody>
              {sites.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="row gap-2"><Pill kind={INTERNSHIP_TAG_COLORS[s.tag]}>{INTERNSHIP_TAG_LABELS[s.tag]}</Pill>
                      <b>{s.name}</b></div>
                  </td>
                  <td>{s.dept}</td>
                  <td>{s.area}</td>
                  <td>{s.field}</td>
                  <td>
                    <div className="row gap-2"><span className="mono">{s.taken}/{s.cap}</span>
                      <div className="meter" style={{width:80}}><span style={{width:(s.taken/s.cap*100)+"%"}}></span></div>
                    </div>
                  </td>
                  <td>{s.status === "open" ? <Pill kind="green">เปิดรับ</Pill> : s.status === "full" ? <Pill kind="red">เต็ม</Pill> : <Pill kind="gray">ปิด</Pill>}</td>
                  <td className="text-right">
                    <div className="row gap-2" style={{justifyContent:"flex-end"}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>toggleSite(s.id)}>{s.status==="open"?"ปิด":"เปิด"}</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>editSite(s)}>แก้ไข</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>removeSite(s.id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "periods" && (
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead><tr><th>ช่วงเวลา</th><th>วันเริ่ม</th><th>วันสิ้นสุด</th><th>ระยะเวลา</th><th>เวลาทำการ</th><th>วันทำงาน</th><th>สถานะ</th><th></th></tr></thead>
            <tbody>
              {periods.map(p => (
                <tr key={p.id}>
                  <td><b>{p.label}</b></td>
                  <td className="mono">{p.start}</td>
                  <td className="mono">{p.end}</td>
                  <td>{p.weeks} สัปดาห์</td>
                  <td className="mono">{p.timeStart}–{p.timeEnd} <span className="muted small">({p.hoursPerDay} ชม./วัน)</span></td>
                  <td>{p.days}</td>
                  <td>{p.open ? <Pill kind="green">เปิดรับสมัคร</Pill> : <Pill kind="gray">ปิด</Pill>}</td>
                  <td className="text-right">
                    <div className="row gap-2" style={{justifyContent:"flex-end"}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>editPeriod(p)}>แก้ไข</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>removePeriod(p.id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "apps" && (
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead><tr><th>นักเรียน</th><th>สถานที่</th><th>ช่วงเวลา</th><th>สถานะ</th><th>การประเมิน</th></tr></thead>
            <tbody>
              {initialApps.map(a => {
                const s = sites.find(x => x.id === a.siteId);
                const p = periods.find(x => x.id === a.periodId);
                return (
                  <tr key={a.id}>
                    <td><b>{a.student}</b><div className="mono small muted">{a.studentId}</div></td>
                    <td>{s ? s.name : "—"}<div className="small muted">{s ? s.dept : ""}</div></td>
                    <td>{p ? p.label : "—"}</td>
                    <td>
                      {a.status === "approved" ? <Pill kind="green">อนุมัติ</Pill> :
                       a.status === "rejected" ? <Pill kind="red">ไม่อนุมัติ</Pill> :
                       <Pill kind="amber">รออนุมัติ</Pill>}
                    </td>
                    <td>
                      {a.evaluated ? <Pill kind="blue">คะแนน {a.score}/5</Pill> :
                       a.reflectionDone ? <Pill kind="purple">รอประเมิน</Pill> :
                       <span className="muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {siteForm && (
        <Modal title={siteForm.id ? "แก้ไขสถานที่ฝึกงาน" : "เพิ่มสถานที่ฝึกงาน"} onClose={()=>setSiteForm(null)} width={680}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setSiteForm(null)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={saveSite}>บันทึก</button>
          </>}>
          <div className="row gap-4">
            <div className="field" style={{flex:2}}>
              <label>ชื่อสถานที่</label>
              <input className="input" value={siteForm.name} onChange={e=>setSiteForm(f=>({...f, name:e.target.value}))} placeholder="เช่น โรงพยาบาลจุฬาลงกรณ์"/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>ประเภท</label>
              <select className="select" value={siteForm.tag} onChange={e=>setSiteForm(f=>({...f, tag:e.target.value}))}>
                <option value="hospital">โรงพยาบาล</option>
                <option value="lab">ห้องปฏิบัติการ</option>
                <option value="gov">หน่วยงานรัฐ</option>
              </select>
            </div>
          </div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}>
              <label>แผนก/สังกัด</label>
              <input className="input" value={siteForm.dept} onChange={e=>setSiteForm(f=>({...f, dept:e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>พื้นที่</label>
              <input className="input" value={siteForm.area} onChange={e=>setSiteForm(f=>({...f, area:e.target.value}))} placeholder="เช่น กรุงเทพฯ"/>
            </div>
          </div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}>
              <label>สายงาน</label>
              <select className="select" value={siteForm.field} onChange={e=>setSiteForm(f=>({...f, field:e.target.value}))}>
                <option>การแพทย์</option><option>เภสัชกรรม</option><option>ห้องปฏิบัติการ</option><option>สาธารณสุข</option>
              </select>
            </div>
            <div className="field" style={{flex:1}}>
              <label>จำนวนที่รับ</label>
              <input className="input" type="number" min="1" value={siteForm.cap} onChange={e=>setSiteForm(f=>({...f, cap:+e.target.value}))}/>
            </div>
          </div>
          <div className="field">
            <label>รายละเอียดงานฝึก</label>
            <textarea className="textarea" value={siteForm.desc} onChange={e=>setSiteForm(f=>({...f, desc:e.target.value}))} placeholder="อธิบายว่านักเรียนจะได้เรียนรู้/ปฏิบัติอะไร"/>
          </div>
        </Modal>
      )}

      {periodForm && (
        <Modal title={periodForm.id ? "แก้ไขช่วงเวลา" : "เพิ่มช่วงเวลาฝึกงาน"} onClose={()=>setPeriodForm(null)} width={640}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setPeriodForm(null)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={savePeriod}>บันทึก</button>
          </>}>
          <div className="field">
            <label>ชื่อช่วงเวลา (แสดงให้นักเรียน)</label>
            <input className="input" value={periodForm.label} onChange={e=>setPeriodForm(f=>({...f, label:e.target.value}))} placeholder="เช่น ภาคฤดูร้อน 2568"/>
          </div>

          <div style={{fontWeight:600, marginBottom:6, marginTop:4}}>📅 วันที่ฝึกงาน</div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}>
              <label>วันเริ่ม</label>
              <input className="input" type="date" value={periodForm.start} onChange={e=>setPeriodForm(f=>({...f, start:e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>วันสิ้นสุด</label>
              <input className="input" type="date" value={periodForm.end} onChange={e=>setPeriodForm(f=>({...f, end:e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>จำนวนสัปดาห์</label>
              <input className="input" type="number" min="1" value={periodForm.weeks} onChange={e=>setPeriodForm(f=>({...f, weeks:+e.target.value}))}/>
            </div>
          </div>

          <div style={{fontWeight:600, marginBottom:6, marginTop:4}}>🕐 เวลาในการฝึกงาน (รายวัน)</div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}>
              <label>เวลาเริ่ม</label>
              <input className="input" type="time" value={periodForm.timeStart} onChange={e=>setPeriodForm(f=>({...f, timeStart:e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>เวลาเลิก</label>
              <input className="input" type="time" value={periodForm.timeEnd} onChange={e=>setPeriodForm(f=>({...f, timeEnd:e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>ชั่วโมง/วัน</label>
              <input className="input" type="number" min="1" max="12" step="0.5" value={periodForm.hoursPerDay} onChange={e=>setPeriodForm(f=>({...f, hoursPerDay:+e.target.value}))}/>
            </div>
          </div>

          <div className="field">
            <label>วันทำงาน</label>
            <select className="select" value={periodForm.days} onChange={e=>setPeriodForm(f=>({...f, days:e.target.value}))}>
              <option>จ.–ศ.</option>
              <option>จ.–ส.</option>
              <option>จ.–อา.</option>
              <option>ตามนัดหมาย</option>
            </select>
          </div>

          <div className="privacy" style={{marginTop:6}}>
            <div className="h">📌 สรุป</div>
            <div className="mt-2 small">
              ฝึกงาน {periodForm.weeks || 0} สัปดาห์ • {periodForm.days || ""} •
              เวลา <b className="mono">{periodForm.timeStart || "--:--"}–{periodForm.timeEnd || "--:--"}</b> น. •
              ประมาณ <b>{((periodForm.hoursPerDay||0) * (periodForm.weeks||0) * (periodForm.days==="จ.–อา."?7: periodForm.days==="จ.–ส."?6:5))} ชั่วโมง</b> รวม
            </div>
          </div>

          <div className="checkbox-row mt-3">
            <input type="checkbox" checked={periodForm.open} onChange={e=>setPeriodForm(f=>({...f, open:e.target.checked}))}/>
            <span>เปิดรับสมัครในช่วงนี้</span>
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, {
  StudentInternship, TeacherInternship, AdminInternship,
});

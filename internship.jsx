/* internship.jsx — Internship (ฝึกงาน) system: Student / Teacher / Admin views */

/* ---------- Data ---------- */
const INTERNSHIP_SITES = [];
const INTERNSHIP_PERIODS = [];
const INTERNSHIP_TAG_COLORS = { hospital:"red", lab:"blue", gov:"purple" };
const INTERNSHIP_TAG_LABELS = { hospital:"โรงพยาบาล", lab:"ห้องปฏิบัติการ", gov:"หน่วยงานรัฐ" };
const initialApps = [];

// DB row → display shape
function mapSiteRow(r) {
  return {
    id: r.id, name: r.name, dept: r.dept || "", area: r.area || "",
    field: r.field || "", cap: r.cap || 0, taken: r.taken || 0,
    desc: r.descr || "", skills: r.skills || [], tag: r.tag || "hospital",
    status: r.status || "open",
    startDate: r.start_date || "", endDate: r.end_date || "",
    hoursPerDay: r.hours_per_day != null ? r.hours_per_day : null,
  };
}
function appStatusLabel(s) {
  if (s === "approved") return { kind:"green", label:"✓ ได้รับอนุมัติ" };
  if (s === "rejected") return { kind:"red",   label:"✖ ไม่อนุมัติ" };
  return { kind:"amber", label:"⌛ รออนุมัติ" };
}

/* ---------- Student: Internship ---------- */
function StudentInternship({ toast }) {
  const backend = !!(window.PfInternship && window.PF_SUPABASE_READY && window.pfCurrentUser);
  const [tab, setTab] = React.useState("browse");
  const [field, setField] = React.useState("all");
  const [sites, setSites] = React.useState([]);
  const [myApp, setMyApp] = React.useState(null);
  const [loading, setLoading] = React.useState(backend);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!backend) { setSites([]); setMyApp(null); setLoading(false); return; }
    setLoading(true);
    try {
      const [siteRows, allApps] = await Promise.all([
        window.PfInternship.sites(),
        window.PfInternship.applications(),
      ]);
      setSites((siteRows || []).map(mapSiteRow));
      const mine = (allApps || []).find(a => a.student_id === window.pfCurrentUser.id);
      setMyApp(mine || null);
    } catch (e) { toast("โหลดข้อมูลฝึกงานไม่สำเร็จ: " + (e.message||e)); }
    finally { setLoading(false); }
  }, [backend, toast]);
  React.useEffect(() => { load(); }, [load]);

  const filteredSites = sites.filter(s => field === "all" || s.field === field);

  const [open, setOpen] = React.useState(null);

  const apply = async (site) => {
    if (site.status === "full") { toast("ที่นั่งเต็มแล้ว"); return; }
    if (!backend) { toast("สมัครได้เมื่อเชื่อมฐานข้อมูลแล้ว"); return; }
    setBusy(true);
    try {
      await window.PfInternship.apply({
        studentId: window.pfCurrentUser.id,
        studentName: window.pfCurrentUser.name,
        siteId: site.id,
        periodId: null,
      });
      toast("ส่งคำขอฝึกงานเรียบร้อย รออาจารย์อนุมัติ");
      setOpen(null);
      setTab("status");
      await load();
    } catch (e) { toast("สมัครไม่สำเร็จ: " + (e.message||e)); }
    finally { setBusy(false); }
  };

  const myAppStatus = myApp ? appStatusLabel(myApp.status) : null;
  const mySite = myApp ? sites.find(s => s.id === myApp.site_id) : null;

  return (
    <div className="page">
      <div className="row-between" style={{marginBottom:6}}>
        <h2 className="mb-0" style={{fontSize:22}}>ฝึกงานในสายวิทยาศาสตร์สุขภาพ</h2>
        {myAppStatus && <Pill kind={myAppStatus.kind}>{myAppStatus.label}</Pill>}
      </div>
      <div className="muted small">เลือกสถานที่ฝึกประสบการณ์ พร้อมประเมินสมรรถนะหลังฝึก</div>

      <div className="tabs mt-4">
        <button className={tab==="browse"?"active":""} onClick={()=>setTab("browse")}>ค้นหาสถานที่</button>
        <button className={tab==="status"?"active":""} onClick={()=>setTab("status")}>คำขอของฉัน</button>
      </div>

      {tab === "browse" && (
        <>
          <div className="filterbar mb-0" style={{marginBottom:14}}>
            <select className="select" value={field} onChange={e=>setField(e.target.value)}>
              <option value="all">ทุกสายงาน</option>
              <option>การแพทย์</option><option>เภสัชกรรม</option><option>ห้องปฏิบัติการ</option><option>สาธารณสุข</option>
            </select>
            <div className="spacer"></div>
            <span className="muted small">พบ {filteredSites.length} สถานที่</span>
          </div>

          {loading ? (
            <div className="card muted" style={{padding:30,textAlign:"center"}}>กำลังโหลด…</div>
          ) : filteredSites.length === 0 ? (
            <div className="card" style={{textAlign:"center", padding:50}}>
              <div className="muted">ยังไม่มีสถานที่ฝึกงานในระบบ — ติดต่อแอดมิน</div>
            </div>
          ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:14}}>
            {filteredSites.map(s => {
              const isMine = myApp && myApp.site_id === s.id;
              return (
                <div key={s.id} className="card" style={{padding:18, display:"flex", flexDirection:"column"}}>
                  <div className="row-between" style={{gap:8, alignItems:"flex-start"}}>
                    <Pill kind={INTERNSHIP_TAG_COLORS[s.tag]}>{INTERNSHIP_TAG_LABELS[s.tag]}</Pill>
                    <span className="small muted">📍 {s.area}</span>
                  </div>
                  <h3 style={{margin:"10px 0 4px", fontSize:16}}>{s.name}</h3>
                  <div className="muted small">{s.dept}</div>
                  {s.desc && <p className="small" style={{margin:"10px 0"}}>{s.desc}</p>}
                  {(s.startDate || s.endDate || s.hoursPerDay) && (
                    <div className="small mono" style={{margin:"4px 0 10px", color:"var(--ink-3)"}}>
                      📅 {s.startDate || "—"} → {s.endDate || "—"}
                      {s.hoursPerDay ? ` • ${s.hoursPerDay} ชม./วัน` : ""}
                    </div>
                  )}
                  {s.skills.length > 0 && (
                    <div className="row gap-2" style={{flexWrap:"wrap", marginBottom:10}}>
                      {s.skills.map((sk,i)=> <Pill key={i} kind="gray">{sk}</Pill>)}
                    </div>
                  )}
                  <div className="row-between mt-2">
                    <div className="small">
                      <span className="muted">ที่นั่ง </span>
                      <b className="mono">{s.cap - s.taken}/{s.cap}</b>
                    </div>
                    {s.status === "full" || s.taken >= s.cap
                      ? <Pill kind="red">เต็ม</Pill>
                      : isMine
                        ? <Pill kind="green">สมัครแล้ว</Pill>
                        : <button className="btn btn-primary btn-sm" onClick={()=>setOpen(s)} disabled={!!myApp || busy}>
                            {myApp ? "สมัครแล้ว (อื่น)" : "เลือกสมัคร"}
                          </button>}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </>
      )}

      {tab === "status" && (
        myApp && mySite ? (
          <div className="card" style={{padding:24}}>
            <div className="row-between" style={{flexWrap:"wrap", gap:8}}>
              <div>
                <h3 style={{marginBottom:4}}>{mySite.name}</h3>
                <div className="muted small">{mySite.dept} • 📍 {mySite.area}</div>
              </div>
              <Pill kind={myAppStatus.kind}>{myAppStatus.label}</Pill>
            </div>
            <div className="divider-h"></div>
            <div className="row gap-4" style={{flexWrap:"wrap"}}>
              <div>
                <div className="small muted">วันที่ฝึก</div>
                <div className="mono"><b>{mySite.startDate || "—"} → {mySite.endDate || "—"}</b></div>
                {mySite.hoursPerDay && <div className="small muted">{mySite.hoursPerDay} ชม./วัน</div>}
              </div>
              <div>
                <div className="small muted">วันที่ส่งคำขอ</div>
                <div><b>{myApp.applied_at ? new Date(myApp.applied_at).toLocaleDateString("th-TH") : "—"}</b></div>
              </div>
              {myApp.evaluated && (
                <div>
                  <div className="small muted">คะแนนประเมิน</div>
                  <div><b className="mono">{myApp.score}/5</b></div>
                </div>
              )}
            </div>
          </div>
        ) : myApp ? (
          <div className="card muted" style={{padding:40,textAlign:"center"}}>ข้อมูลสถานที่ที่สมัครไม่ครบ</div>
        ) : (
          <div className="card" style={{textAlign:"center", padding:60}}>
            <div style={{fontSize:36}}>🩺</div>
            <h3 className="mt-3">ยังไม่ได้สมัครฝึกงาน</h3>
            <div className="muted">กลับไปที่ <a href="#" onClick={e=>{e.preventDefault(); setTab("browse");}}>หน้าค้นหาสถานที่</a> เพื่อเลือกที่ฝึก</div>
          </div>
        )
      )}

      {open && (
        <Modal title={open.name} onClose={()=>setOpen(null)} width={620}
          footer={<>
            <button className="btn btn-ghost" onClick={()=>setOpen(null)}>ปิด</button>
            <button className="btn btn-primary" onClick={()=>apply(open)} disabled={busy}>{busy?"กำลังส่ง…":"ยืนยันสมัครฝึกงาน"}</button>
          </>}>
          <div className="muted small">{open.dept} • 📍 {open.area} • สายงาน {open.field}</div>
          {open.desc && <p className="mt-3">{open.desc}</p>}
          {open.skills.length > 0 && (<>
            <div className="divider-h"></div>
            <div className="small" style={{fontWeight:600, marginBottom:6}}>สมรรถนะที่จะได้พัฒนา</div>
            <div className="row gap-2" style={{flexWrap:"wrap"}}>
              {open.skills.map((sk,i)=> <Pill key={i} kind="blue">{sk}</Pill>)}
            </div>
          </>)}
          <div className="divider-h"></div>
          <div className="row gap-4" style={{flexWrap:"wrap"}}>
            <div><div className="small muted">วันที่ฝึก</div><b className="mono">{open.startDate || "—"} → {open.endDate || "—"}</b></div>
            {open.hoursPerDay && <div><div className="small muted">ชั่วโมง/วัน</div><b className="mono">{open.hoursPerDay} ชม.</b></div>}
            <div><div className="small muted">ที่นั่งคงเหลือ</div><b className="mono">{open.cap - open.taken}/{open.cap}</b></div>
          </div>
          <div className="privacy mt-4">
            <div className="h">📌 หมายเหตุ</div>
            <div className="mt-2">ระบบจะส่งคำขอให้อาจารย์อนุมัติก่อน — ดูสถานะได้ที่แท็บ "คำขอของฉัน"</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Teacher: Internship evaluation ---------- */
function TeacherInternship({ toast }) {
  const backend = !!(window.PfInternship && window.PF_SUPABASE_READY);
  const [apps, setApps] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [tab, setTab] = React.useState("pending");
  const [loading, setLoading] = React.useState(backend);

  const load = React.useCallback(async () => {
    if (!backend) { setLoading(false); return; }
    setLoading(true);
    try {
      const [appRows, siteRows] = await Promise.all([
        window.PfInternship.applications(),
        window.PfInternship.sites(),
      ]);
      setApps(appRows || []);
      setSites((siteRows || []).map(mapSiteRow));
    } catch (e) { toast("โหลดคำขอไม่สำเร็จ: " + (e.message||e)); }
    finally { setLoading(false); }
  }, [backend, toast]);
  React.useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await window.PfInternship.setStatus(id, status);
      toast(status === "approved" ? "อนุมัติคำขอแล้ว" : "ปฏิเสธคำขอแล้ว");
      await load();
    } catch (e) { toast("อัปเดตไม่สำเร็จ: " + (e.message||e)); }
  };

  const pending = apps.filter(a => a.status === "pending");
  const ongoing = apps.filter(a => a.status === "approved" && !a.evaluated);
  const done    = apps.filter(a => a.evaluated);
  const list = tab === "pending" ? pending : tab === "ongoing" ? ongoing : done;

  return (
    <div className="page">
      <h2 style={{fontSize:22}}>การฝึกงานของนักเรียน</h2>
      <div className="muted small">อนุมัติ/ปฏิเสธคำขอ และดูภาพรวมว่านักเรียนคนไหนเลือกฝึกที่ไหน</div>

      <div className="stat-grid mt-4" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="stat stat-amber"><div className="num">{pending.length}</div><div className="lbl">รออนุมัติ</div></div>
        <div className="stat stat-blue"><div className="num">{ongoing.length}</div><div className="lbl">กำลังฝึก</div></div>
        <div className="stat stat-green"><div className="num">{done.length}</div><div className="lbl">เสร็จสิ้น</div></div>
      </div>

      <div className="tabs mt-4">
        <button className={tab==="pending"?"active":""} onClick={()=>setTab("pending")}>รออนุมัติ ({pending.length})</button>
        <button className={tab==="ongoing"?"active":""} onClick={()=>setTab("ongoing")}>กำลังฝึก ({ongoing.length})</button>
        <button className={tab==="done"   ?"active":""} onClick={()=>setTab("done")}>เสร็จสิ้น ({done.length})</button>
      </div>

      {loading ? (
        <div className="card muted" style={{padding:40,textAlign:"center"}}>กำลังโหลด…</div>
      ) : list.length === 0 ? (
        <div className="card" style={{textAlign:"center", padding:50}}>
          <div className="muted">ไม่มีรายการในหมวดนี้</div>
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          {list.map(a => {
            const site = sites.find(s => s.id === a.site_id);
            return (
              <div className="item" key={a.id}>
                <Avatar emoji="👩‍🎓" size={48}/>
                <div className="body">
                  <h3 style={{margin:0}}>{a.student_name || "—"}</h3>
                  <div className="muted small mt-2">
                    📍 {site ? site.name : "—"}{site && site.dept ? " • " + site.dept : ""}
                  </div>
                  {site && (site.startDate || site.endDate) && (
                    <div className="muted small mono mt-2">🗓 {site.startDate || "—"} → {site.endDate || "—"}{site.hoursPerDay ? ` • ${site.hoursPerDay} ชม./วัน` : ""}</div>
                  )}
                  <div className="muted small mt-2">ส่งคำขอ {a.applied_at ? new Date(a.applied_at).toLocaleDateString("th-TH") : "—"}</div>
                  {a.evaluated && <Pill kind="green">คะแนน {a.score}/5</Pill>}
                </div>
                <div className="row gap-2">
                  {a.status === "pending" && <>
                    <button className="btn btn-teal btn-sm" onClick={()=>setStatus(a.id, "approved")}>อนุมัติ</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setStatus(a.id, "rejected")} style={{color:"#dc2626"}}>ปฏิเสธ</button>
                  </>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Admin: Internship management ---------- */
function AdminInternship({ toast }) {
  const backend = !!(window.PfInternship && window.PF_SUPABASE_READY);
  const [tab, setTab] = React.useState("sites");
  const [sites, setSites] = React.useState([]);
  const [loading, setLoading] = React.useState(backend);
  const [siteForm, setSiteForm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  // DB row → form/display shape (snake_case → camelCase)
  const mapSite = (r) => ({
    id: r.id, name: r.name, dept: r.dept || "", area: r.area || "",
    field: r.field || "การแพทย์", cap: r.cap || 0, taken: r.taken || 0,
    desc: r.descr || "", skills: r.skills || [], tag: r.tag || "hospital",
    status: r.status || "open",
    startDate: r.start_date || "", endDate: r.end_date || "",
    hoursPerDay: r.hours_per_day != null ? r.hours_per_day : null,
  });

  const [apps, setApps] = React.useState([]);

  const loadSites = React.useCallback(async () => {
    if (!backend) { setSites([]); setApps([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [siteRows, appRows] = await Promise.all([
        window.PfInternship.sites(),
        window.PfInternship.applications(),
      ]);
      setSites((siteRows || []).map(mapSite));
      setApps(appRows || []);
    } catch (e) { toast("โหลดข้อมูลไม่สำเร็จ: " + (e.message||e)); }
    finally { setLoading(false); }
  }, [backend, toast]);
  React.useEffect(() => { loadSites(); }, [loadSites]);

  const newSite = () => setSiteForm({
    id:"", name:"", dept:"", area:"", field:"การแพทย์", cap:3, taken:0,
    desc:"", skills:[], tag:"hospital", status:"open",
    startDate:"", endDate:"", hoursPerDay:null,
  });
  const editSite = (s) => setSiteForm({ ...s });

  const saveSite = async () => {
    if (!siteForm.name) { toast("กรุณากรอกชื่อสถานที่"); return; }
    if (!backend) {
      // โหมดสาธิต
      setSites(list => {
        const existing = list.find(x => x.id === siteForm.id);
        if (existing) return list.map(x => x.id === siteForm.id ? siteForm : x);
        return [{ ...siteForm, id: "s" + Date.now() }, ...list];
      });
      setSiteForm(null);
      toast("บันทึกสถานที่ฝึกงานเรียบร้อย");
      return;
    }
    setBusy(true);
    try {
      const dbRow = {
        id: siteForm.id || "s" + Date.now(),
        name: siteForm.name, dept: siteForm.dept || null,
        area: siteForm.area || null, field: siteForm.field || null,
        cap: siteForm.cap || 0, taken: siteForm.taken || 0,
        descr: siteForm.desc || null, skills: siteForm.skills || [],
        tag: siteForm.tag, status: siteForm.status,
        start_date: siteForm.startDate || null, end_date: siteForm.endDate || null,
        hours_per_day: siteForm.hoursPerDay || null,
      };
      await window.PfInternship.saveSite(dbRow);
      setSiteForm(null);
      toast("บันทึกสถานที่ฝึกงานเรียบร้อย");
      await loadSites();
    } catch (e) { toast("บันทึกไม่สำเร็จ: " + (e.message||e)); }
    finally { setBusy(false); }
  };

  const removeSite = async (id) => {
    if (!confirm("ลบสถานที่ฝึกงานนี้?")) return;
    if (!backend) {
      setSites(s => s.filter(x => x.id !== id));
      toast("ลบสถานที่แล้ว");
      return;
    }
    try {
      await window.PfInternship.deleteSite(id);
      toast("ลบสถานที่แล้ว");
      await loadSites();
    } catch (e) { toast("ลบไม่สำเร็จ: " + (e.message||e)); }
  };

  const toggleSite = async (id) => {
    const site = sites.find(s => s.id === id);
    if (!site) return;
    const newStatus = site.status === "open" ? "closed" : "open";
    setSites(s => s.map(x => x.id === id ? { ...x, status: newStatus } : x));
    if (backend) {
      try {
        await window.PfInternship.saveSite({
          id, name: site.name, dept: site.dept, area: site.area, field: site.field,
          cap: site.cap, taken: site.taken, descr: site.desc, skills: site.skills,
          tag: site.tag, status: newStatus,
          start_date: site.startDate || null, end_date: site.endDate || null,
          hours_per_day: site.hoursPerDay || null,
        });
      } catch (e) { toast("เปลี่ยนสถานะไม่สำเร็จ: " + (e.message||e)); await loadSites(); }
    }
  };

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h2 className="mb-0" style={{fontSize:22}}>จัดการระบบฝึกงาน</h2>
          <div className="muted small">กำหนดสถานที่ฝึกประสบการณ์ จำนวนรับ และช่วงเวลาให้นักเรียนเลือกสมัคร</div>
        </div>
        {tab === "sites" && (
          <button className="btn btn-primary btn-sm" onClick={newSite}><Icons.plus/> เพิ่มสถานที่</button>
        )}
      </div>

      <div className="tabs mt-4">
        <button className={tab==="sites"?"active":""} onClick={()=>setTab("sites")}>สถานที่ฝึกงาน ({sites.length})</button>
        <button className={tab==="apps"?"active":""} onClick={()=>setTab("apps")}>คำขอของนักเรียน</button>
      </div>

      {tab === "sites" && (
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead><tr><th>สถานที่</th><th>สังกัด/แผนก</th><th>พื้นที่</th><th>ช่วงเวลา</th><th>ที่นั่ง</th><th>สถานะ</th><th className="text-right">การจัดการ</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="muted" style={{padding:20,textAlign:"center"}}>กำลังโหลด…</td></tr>
              ) : sites.length === 0 ? (
                <tr><td colSpan={7} className="muted" style={{padding:30,textAlign:"center"}}>ยังไม่มีสถานที่ฝึกงาน — กด "+ เพิ่มสถานที่"</td></tr>
              ) : sites.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="row gap-2"><Pill kind={INTERNSHIP_TAG_COLORS[s.tag]}>{INTERNSHIP_TAG_LABELS[s.tag]}</Pill>
                      <b>{s.name}</b></div>
                  </td>
                  <td>{s.dept}</td>
                  <td>{s.area}</td>
                  <td className="mono small">
                    {s.startDate && s.endDate
                      ? <>{s.startDate}<br/>↓ <span className="muted">{s.endDate}</span>{s.hoursPerDay ? <div className="muted">{s.hoursPerDay} ชม./วัน</div> : null}</>
                      : <span className="muted">—</span>}
                  </td>
                  <td>
                    <div className="row gap-2"><span className="mono">{s.taken}/{s.cap}</span>
                      <div className="meter" style={{width:80}}><span style={{width:(s.cap?s.taken/s.cap*100:0)+"%"}}></span></div>
                    </div>
                  </td>
                  <td>{s.status === "open" ? <Pill kind="green">เปิดรับ</Pill> : s.status === "full" ? <Pill kind="red">เต็ม</Pill> : <Pill kind="gray">ปิด</Pill>}</td>
                  <td className="text-right">
                    <div className="row gap-2" style={{justifyContent:"flex-end"}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>toggleSite(s.id)}>{s.status==="open"?"ปิด":"เปิด"}</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>editSite(s)}>แก้ไข</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>removeSite(s.id)} style={{color:"#dc2626"}}>ลบ</button>
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
            <thead><tr><th>นักเรียน</th><th>สถานที่</th><th>ช่วงเวลา</th><th>วันสมัคร</th><th>สถานะ</th><th>การประเมิน</th></tr></thead>
            <tbody>
              {apps.length === 0 ? (
                <tr><td colSpan={6} className="muted" style={{padding:30,textAlign:"center"}}>ยังไม่มีคำขอจากนักเรียน</td></tr>
              ) : apps.map(a => {
                const s = sites.find(x => x.id === a.site_id);
                return (
                  <tr key={a.id}>
                    <td><b>{a.student_name || "—"}</b></td>
                    <td>{s ? s.name : "—"}<div className="small muted">{s ? s.dept : ""}</div></td>
                    <td className="mono small">
                      {s && (s.startDate || s.endDate)
                        ? <>{s.startDate || "—"} → {s.endDate || "—"}</>
                        : <span className="muted">—</span>}
                    </td>
                    <td className="mono small">{a.applied_at ? new Date(a.applied_at).toLocaleDateString("th-TH") : "—"}</td>
                    <td>
                      {a.status === "approved" ? <Pill kind="green">อนุมัติ</Pill> :
                       a.status === "rejected" ? <Pill kind="red">ไม่อนุมัติ</Pill> :
                       <Pill kind="amber">รออนุมัติ</Pill>}
                    </td>
                    <td>
                      {a.evaluated ? <Pill kind="blue">คะแนน {a.score}/5</Pill> :
                       a.reflection_done ? <Pill kind="purple">รอประเมิน</Pill> :
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
            <button className="btn btn-primary" onClick={saveSite} disabled={busy}>{busy?"กำลังบันทึก…":"บันทึก"}</button>
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

          <div style={{fontWeight:600, marginBottom:6, marginTop:10}}>📅 ช่วงเวลาฝึกงาน</div>
          <div className="row gap-4">
            <div className="field" style={{flex:1}}>
              <label>วันเริ่มต้น</label>
              <input className="input" type="date" value={siteForm.startDate || ""}
                onChange={e=>setSiteForm(f=>({...f, startDate: e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>วันสิ้นสุด</label>
              <input className="input" type="date" value={siteForm.endDate || ""}
                onChange={e=>setSiteForm(f=>({...f, endDate: e.target.value}))}/>
            </div>
            <div className="field" style={{flex:1}}>
              <label>ชั่วโมง/วัน</label>
              <input className="input" type="number" min="1" max="24" step="0.5"
                value={siteForm.hoursPerDay || ""}
                onChange={e=>setSiteForm(f=>({...f, hoursPerDay: e.target.value ? +e.target.value : null}))}
                placeholder="เช่น 8"/>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

Object.assign(window, {
  StudentInternship, TeacherInternship, AdminInternship,
});

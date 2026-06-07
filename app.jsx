/* app.jsx — Login + role routing for PDSHS e-Portfolio */

function Login({ onLogin }) {
  const [role, setRole] = React.useState("student");
  const [id, setId] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [view, setView] = React.useState("login"); // login | forgot
  const [fpEmail, setFpEmail] = React.useState("");
  const [fpMsg, setFpMsg] = React.useState("");
  const [fpBusy, setFpBusy] = React.useState(false);

  const hasBackend = window.PfAuth?.available?.();

  const sendReset = async (e) => {
    e.preventDefault();
    setFpMsg("");
    if (!hasBackend) { setFpMsg("ระบบออฟไลน์ — รีเซ็ตรหัสผ่านไม่ได้"); return; }
    setFpBusy(true);
    try {
      await window.PfAuth.resetPassword(fpEmail.trim());
      setFpMsg("✓ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว — เปิดเมลแล้วกดลิงก์เพื่อตั้งรหัสใหม่ (เช็คกล่อง Spam ด้วย)");
    } catch (e2) {
      setFpMsg("ส่งไม่สำเร็จ: " + (e2?.message || e2));
    } finally {
      setFpBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (hasBackend) {
      setBusy(true);
      try {
        await window.PfAuth.signIn(id.trim(), pw);
        const profile = await window.PfAuth.getProfile();
        if (!profile) throw new Error("ไม่พบข้อมูลผู้ใช้ในระบบ (ติดต่อผู้ดูแล)");
        window.pfCurrentUser = profile;
        await window.applyRubricOverrides?.();
        onLogin(profile.role, profile);
      } catch (e2) {
        setErr(e2?.message === "Invalid login credentials"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : (e2?.message || "เข้าสู่ระบบไม่สำเร็จ"));
      } finally {
        setBusy(false);
      }
      return;
    }
    // ไม่มี backend (รันออฟไลน์) → โหมดสาธิตตามบทบาทที่เลือก
    window.pfCurrentUser = null;
    onLogin(role, null);
  };

  const hints = {
    student: { idLabel: "รหัสนักเรียน", idPh: "65001234", pwLabel: "เลขประจำตัวประชาชน (13 หลัก)", pwPh: "กรอกเลขประจำตัวประชาชน" },
    teacher: { idLabel: "รหัสบุคลากร", idPh: "T-0238",   pwLabel: "รหัสผ่าน", pwPh: "กรอกรหัสผ่าน" },
    admin:   { idLabel: "รหัสผู้ดูแลระบบ", idPh: "ADM-001",  pwLabel: "รหัสผ่าน", pwPh: "กรอกรหัสผ่าน" },
  }[role];

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="logo"><BrandMark size={96}/></div>
        <h1>เข้าสู่ระบบ</h1>
        <div className="sub">PDS_HS Portfolio System</div>
        <div className="desc">แฟ้มสะสมผลงาน วิชาเอกวิทยาศาสตร์สุขภาพ</div>

        {view === "forgot" ? (
          <>
            <form onSubmit={sendReset}>
              <div className="field">
                <label>อีเมลที่ใช้เข้าระบบ</label>
                <input className="input" type="email" placeholder="you@pdshs.ac.th"
                  value={fpEmail} onChange={e=>setFpEmail(e.target.value)} required/>
              </div>
              {fpMsg && <div style={{margin:"4px 0 10px",fontSize:13,color: fpMsg.startsWith("✓")?"#059669":"#dc2626"}}>{fpMsg}</div>}
              <button className="login-submit" type="submit" disabled={fpBusy}>
                {fpBusy ? "กำลังส่ง…" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </button>
            </form>
            <div className="login-foot">
              <a href="#" onClick={e=>{e.preventDefault(); setView("login"); setFpMsg("");}}>← กลับไปเข้าสู่ระบบ</a>
            </div>
            <div className="login-hint">
              <span>ระบบจะส่งลิงก์ไปที่อีเมล กดลิงก์แล้วตั้งรหัสผ่านใหม่ได้เลย</span>
            </div>
          </>
        ) : (
          <>
            {!hasBackend && (
              <div className="role-tabs" role="tablist" aria-label="เลือกบทบาท">
                <button className={role==="student"?"active":""} onClick={()=>setRole("student")}>👩‍🎓 นักเรียน</button>
                <button className={role==="teacher"?"active":""} onClick={()=>setRole("teacher")}>👨‍🏫 อาจารย์ผู้ประเมิน</button>
                <button className={role==="admin"  ?"active":""} onClick={()=>setRole("admin")}>🛡️ ผู้ดูแลระบบ</button>
              </div>
            )}

            <form onSubmit={submit}>
              <div className="field">
                <label>{hasBackend ? "อีเมล" : hints.idLabel}</label>
                <input className="input" type={hasBackend ? "email" : "text"}
                  placeholder={hasBackend ? "you@pdshs.ac.th" : hints.idPh}
                  value={id} onChange={e=>setId(e.target.value)} required/>
              </div>
              <div className="field">
                <label>{hasBackend ? "รหัสผ่าน" : hints.pwLabel}</label>
                <input className="input" type="password"
                  placeholder={hasBackend ? "กรอกรหัสผ่าน" : hints.pwPh}
                  value={pw} onChange={e=>setPw(e.target.value)} required/>
              </div>
              {err && <div className="login-err" style={{margin:"4px 0 10px",fontSize:13,color:"#dc2626"}}>{err}</div>}
              <button className="login-submit" type="submit" disabled={busy}>
                {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
              </button>
            </form>

            <div className="login-foot">
              {hasBackend
                ? <a href="#" onClick={e=>{e.preventDefault(); setView("forgot"); setErr("");}}>ลืมรหัสผ่าน?</a>
                : <a href="#" onClick={e=>e.preventDefault()}>ลืมรหัสผ่าน / ติดต่อผู้ดูแลระบบ</a>}
            </div>

            <div className="login-hint">
              {hasBackend
                ? <span>เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ผู้ดูแลระบบออกให้</span>
                : <span><b>โหมดสาธิต (ออฟไลน์):</b> กดปุ่ม "เข้าสู่ระบบ" เพื่อเข้าตามบทบาทที่เลือก</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SetPasswordScreen({ onDone }) {
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
      setMsg("✓ ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ…");
      setTimeout(onDone, 1200);
    } catch (e2) {
      setMsg("ไม่สำเร็จ: " + (e2?.message || e2));
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="logo"><BrandMark size={96}/></div>
        <h1>ตั้งรหัสผ่านใหม่</h1>
        <div className="desc">กรอกรหัสผ่านใหม่ที่ต้องการใช้</div>
        <form onSubmit={submit}>
          <div className="field">
            <label>รหัสผ่านใหม่</label>
            <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" required/>
          </div>
          <div className="field">
            <label>ยืนยันรหัสผ่านใหม่</label>
            <input className="input" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="กรอกซ้ำอีกครั้ง" required/>
          </div>
          {msg && <div style={{margin:"4px 0 10px",fontSize:13,color: msg.startsWith("✓")?"#059669":"#dc2626"}}>{msg}</div>}
          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [role, setRole] = React.useState(null); // null | student | teacher | admin
  const [page, setPage] = React.useState("home");
  const [toastMsg, ToastNode] = useToast();

  const [booting, setBooting] = React.useState(true);
  const [recovery, setRecovery] = React.useState(false);

  // ดักลิงก์รีเซ็ตรหัสผ่านจากอีเมล → แสดงหน้าตั้งรหัสใหม่
  React.useEffect(() => {
    if (!window.PfAuth?.available?.()) return;
    if (/type=recovery/.test(window.location.hash)) setRecovery(true);
    const { data } = window.PfAuth.onAuthChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => { try { data.subscription.unsubscribe(); } catch (e) {} };
  }, []);

  const login = (r) => {
    setRole(r);
    setPage(r === "student" ? "home" : r === "teacher" ? "t-home" : "a-home");
  };
  const logout = async () => {
    try { await window.PfAuth?.signOut?.(); } catch (e) { /* offline */ }
    window.pfCurrentUser = null;
    setRole(null);
    setPage("home");
  };

  // คืน session เดิมถ้ายังล็อกอินค้างอยู่
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const session = await window.PfAuth?.getSession?.();
        if (session && alive) {
          const profile = await window.PfAuth.getProfile();
          if (profile && alive) {
            window.pfCurrentUser = profile;
            await window.applyRubricOverrides?.();
            login(profile.role);
          }
        }
      } catch (e) { /* offline */ }
      finally { if (alive) setBooting(false); }
    })();
    return () => { alive = false; };
  }, []);

  if (recovery) return <><SetPasswordScreen onDone={()=>{ setRecovery(false); window.location.href = window.location.origin + window.location.pathname; }}/>{ToastNode}</>;
  if (booting) return null;
  if (!role) return <><Login onLogin={login}/>{ToastNode}</>;

  const nav =
    role === "student" ? STUDENT_NAV :
    role === "teacher" ? TEACHER_NAV : ADMIN_NAV;

  let view = null;
  if (role === "student") {
    if      (page === "home")       view = <StudentHome go={setPage} toast={toastMsg}/>;
    else if (page === "portfolio")  view = <StudentPortfolio toast={toastMsg}/>;
    else if (page === "upload")     view = <StudentUpload toast={toastMsg} go={setPage}/>;
    else if (page === "rubrics")    view = <StudentRubrics/>;
    else if (page === "activities") view = <StudentActivities toast={toastMsg}/>;
    else if (page === "internship") view = <StudentInternship toast={toastMsg}/>;
    else if (page === "profile")    view = <StudentProfile toast={toastMsg} onLogout={logout}/>;
  } else if (role === "teacher") {
    if      (page === "t-home")     view = <TeacherHome go={setPage}/>;
    else if (page === "t-review")   view = <TeacherReview toast={toastMsg}/>;
    else if (page === "t-students") view = <TeacherStudents toast={toastMsg}/>;
    else if (page === "t-rubrics")  view = <StudentRubrics/>;
    else if (page === "t-internship") view = <TeacherInternship toast={toastMsg}/>;
    else if (page === "t-history")  view = <TeacherHistory/>;
    else if (page === "t-announce") view = <TeacherAnnounce toast={toastMsg}/>;
    else if (page === "t-profile")  view = <TeacherProfile toast={toastMsg} onLogout={logout}/>;
  } else {
    if      (page === "a-home")       view = <AdminHome go={setPage}/>;
    else if (page === "a-users")      view = <AdminUsers toast={toastMsg}/>;
    else if (page === "a-activities") view = <AdminActivities toast={toastMsg}/>;
    else if (page === "a-internship") view = <AdminInternship toast={toastMsg}/>;
    else if (page === "a-rubrics")    view = <AdminRubrics toast={toastMsg}/>;
    else if (page === "a-reports")    view = <AdminReports/>;
    else if (page === "a-settings")   view = <AdminSettings toast={toastMsg} onLogout={logout}/>;
  }

  return (
    <div className="app-shell">
      <Topbar role={role} current={page} onNavigate={setPage} onLogout={logout} items={nav}/>
      {view}
      {ToastNode}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

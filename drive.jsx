/* drive.jsx — Google Drive link parser & preview components */

/* ---------- Parse various Google Drive URL formats ---------- */
function parseDriveLink(url) {
  if (!url) return null;
  url = url.trim();
  let m;

  // https://drive.google.com/file/d/FILE_ID/view
  m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return mkDrive(m[1], "file", url);

  // https://drive.google.com/open?id=FILE_ID  or  uc?id=
  m = url.match(/drive\.google\.com\/(?:open|uc)\?[^#]*[?&]?id=([a-zA-Z0-9_-]{10,})/) ||
      url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]{10,})/);
  if (m) return mkDrive(m[1], "file", url);

  // https://docs.google.com/document|spreadsheets|presentation|forms/d/FILE_ID
  m = url.match(/docs\.google\.com\/(document|spreadsheets|presentation|forms)\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) {
    const kindMap = { document:"doc", spreadsheets:"sheet", presentation:"slides", forms:"form" };
    return mkDrive(m[2], kindMap[m[1]], url);
  }

  // https://drive.google.com/drive/folders/FOLDER_ID
  m = url.match(/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (m) return mkDrive(m[1], "folder", url);

  return null;
}

function mkDrive(id, kind, origUrl) {
  const KIND = {
    file:   { label:"ไฟล์",          icon:"📁", color:"#64748b" },
    doc:    { label:"Google เอกสาร", icon:"📄", color:"#3b82f6" },
    sheet:  { label:"Google ชีต",    icon:"📊", color:"#10b981" },
    slides: { label:"Google สไลด์",  icon:"📽️", color:"#f59e0b" },
    form:   { label:"Google ฟอร์ม",  icon:"📋", color:"#8b5cf6" },
    folder: { label:"โฟลเดอร์",      icon:"🗂️", color:"#ec4899" },
  };
  const k = KIND[kind];
  let embedUrl, openUrl;
  switch (kind) {
    case "file":   embedUrl = `https://drive.google.com/file/d/${id}/preview`;
                   openUrl  = `https://drive.google.com/file/d/${id}/view`; break;
    case "doc":    embedUrl = `https://docs.google.com/document/d/${id}/preview`;
                   openUrl  = `https://docs.google.com/document/d/${id}/edit`; break;
    case "sheet":  embedUrl = `https://docs.google.com/spreadsheets/d/${id}/preview`;
                   openUrl  = `https://docs.google.com/spreadsheets/d/${id}/edit`; break;
    case "slides": embedUrl = `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false`;
                   openUrl  = `https://docs.google.com/presentation/d/${id}/edit`; break;
    case "form":   embedUrl = `https://docs.google.com/forms/d/${id}/viewform?embedded=true`;
                   openUrl  = `https://docs.google.com/forms/d/${id}/edit`; break;
    case "folder": embedUrl = `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
                   openUrl  = `https://drive.google.com/drive/folders/${id}`; break;
  }
  // Universal Drive thumbnail endpoint (works without auth for public items)
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
  return {
    id, kind, label: k.label, icon: k.icon, color: k.color,
    embedUrl, openUrl, thumbnailUrl, originalUrl: origUrl,
  };
}

/* ---------- Thumbnail preview card with click-to-expand modal ---------- */
function DrivePreview({ item, title, onRemove, compact }) {
  const [imgOk, setImgOk] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const fallback = (
    <div style={{
      width:"100%", aspectRatio: compact ? "16/9" : "4/3",
      background: `linear-gradient(135deg, ${item.color}22, ${item.color}10)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:6, color: item.color, borderRadius:"10px 10px 0 0",
    }}>
      <div style={{fontSize:42}}>{item.icon}</div>
      <div className="small" style={{fontWeight:600}}>{item.label}</div>
      <div className="small muted mono">{item.id.slice(0,10)}…</div>
    </div>
  );

  return (
    <>
      <div className="drive-card" style={{
        border:"1px solid var(--line)", borderRadius:12, overflow:"hidden", background:"#fff",
        display:"flex", flexDirection:"column", boxShadow:"var(--shadow-sm)",
      }}>
        <button onClick={()=>setOpen(true)} style={{padding:0, border:0, background:"transparent", cursor:"pointer", position:"relative"}}>
          {imgOk
            ? <img src={item.thumbnailUrl} alt=""
                onError={()=>setImgOk(false)} loading="lazy"
                style={{
                  width:"100%", aspectRatio: compact ? "16/9" : "4/3",
                  objectFit:"cover", display:"block", background:"#f1f5f9",
                  borderRadius:"10px 10px 0 0",
                }}/>
            : fallback}
          <div style={{
            position:"absolute", top:8, left:8,
            background:"rgba(15,23,42,.65)", color:"#fff",
            padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600,
          }}>
            <span style={{marginRight:4}}>{item.icon}</span>{item.label}
          </div>
          <div style={{
            position:"absolute", bottom:8, right:8,
            background:"rgba(15,23,42,.7)", color:"#fff",
            padding:"4px 8px", borderRadius:6, fontSize:11,
            display:"flex", alignItems:"center", gap:4,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            ดูตัวอย่าง
          </div>
        </button>
        <div style={{padding:"10px 12px", display:"flex", alignItems:"center", gap:8}}>
          <div style={{flex:1, minWidth:0}}>
            <div className="small" style={{
              fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
            }} title={title || item.label}>{title || item.label}</div>
            <a className="small muted mono" href={item.openUrl} target="_blank" rel="noreferrer"
               style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block"}}>
              {item.id.slice(0,16)}…
            </a>
          </div>
          {onRemove && (
            <button className="icon-btn" onClick={onRemove} title="ลบ" style={{width:28, height:28}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {open && (
        <Modal title={`${item.icon} ${title || item.label}`} onClose={()=>setOpen(false)} width={900}
          footer={<>
            <a className="btn btn-ghost" href={item.openUrl} target="_blank" rel="noreferrer">เปิดใน Google Drive ↗</a>
            <button className="btn btn-primary" onClick={()=>setOpen(false)}>ปิด</button>
          </>}>
          <div style={{
            position:"relative", width:"100%", aspectRatio:"16/10",
            background:"#0f172a", borderRadius:10, overflow:"hidden",
          }}>
            <iframe
              src={item.embedUrl}
              title={title || item.label}
              style={{position:"absolute", inset:0, width:"100%", height:"100%", border:0}}
              allow="autoplay"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="muted small mt-3">
            ⓘ ระบบดึงตัวอย่างจาก Google Drive โดยตรง — ผู้สร้างต้องตั้งสิทธิ์ไฟล์เป็น
            <b> "ทุกคนที่มีลิงก์เปิดดูได้"</b> เพื่อให้อาจารย์เข้าถึงได้
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------- Multi-link input — paste a URL, parse, preview ---------- */
function DriveLinkInput({ value = [], onChange }) {
  const [draft, setDraft] = React.useState("");
  const [err, setErr] = React.useState("");

  const add = () => {
    if (!draft.trim()) return;
    const parsed = parseDriveLink(draft);
    if (!parsed) {
      setErr("ไม่ใช่ลิงก์ Google Drive ที่ถูกต้อง (ตัวอย่าง: drive.google.com/file/d/.../view)");
      return;
    }
    if (value.find(v => v.id === parsed.id)) {
      setErr("ลิงก์นี้ถูกเพิ่มแล้ว");
      return;
    }
    onChange([...value, parsed]);
    setDraft(""); setErr("");
  };
  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="row gap-2">
        <input
          className="input"
          placeholder="วางลิงก์ Google Drive / Docs / Sheets / Slides / Forms"
          value={draft}
          onChange={e=>{ setDraft(e.target.value); setErr(""); }}
          onKeyDown={e=>{ if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button type="button" className="btn btn-primary" onClick={add}>+ เพิ่มลิงก์</button>
      </div>
      {err && <div className="small" style={{color:"var(--red)", marginTop:6}}>{err}</div>}
      <div className="small muted mt-2">
        💡 รับ Google ไฟล์/เอกสาร/ชีต/สไลด์/ฟอร์ม/โฟลเดอร์ — ระบบจะดึง preview มาแสดงอัตโนมัติ
      </div>

      {value.length > 0 && (
        <div className="mt-4" style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12,
        }}>
          {value.map((item, i) => (
            <DrivePreview key={item.id} item={item} compact onRemove={()=>removeAt(i)}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Grid for displaying multiple previews (read-only) ---------- */
function DrivePreviewGrid({ items, columns = 2 }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 1 ? "100%" : "240px"}, 1fr))`,
      gap:12,
    }}>
      {items.map(item => (
        <DrivePreview key={item.id} item={item}/>
      ))}
    </div>
  );
}

Object.assign(window, { parseDriveLink, DrivePreview, DriveLinkInput, DrivePreviewGrid });

/* portfolio-api.jsx — data layer over the standalone portfolio Supabase.
   คืน null ถ้า Supabase ยังไม่พร้อม (กัน crash) */

const _pf = () => window.pfdb;

const PfUsers = {
  async list() {
    if (!_pf()) return null;
    const { data, error } = await _pf().from('users').select('*').order('created_at');
    if (error) throw error;
    return data;
  },
  async updateRole(id, role) {
    if (!_pf()) return null;
    const { error } = await _pf().from('users').update({ role }).eq('id', id);
    if (error) throw error;
  },
  // แก้ไขข้อมูลผู้ใช้ (name, student_code, grade ฯลฯ)
  async update(id, fields) {
    if (!_pf()) return null;
    const { error } = await _pf().from('users').update(fields).eq('id', id);
    if (error) throw error;
  },
  // ลบผู้ใช้แบบสมบูรณ์ (ทั้ง auth.users + public.users)
  // ผ่าน Edge Function `delete-user` ที่ใช้ service_role (ฝั่ง client ทำตรง ๆ ไม่ได้)
  async remove(id) {
    if (!_pf()) return null;
    const { data, error } = await _pf().functions.invoke('delete-user', {
      body: { user_id: id },
    });
    if (error) {
      // FunctionsHttpError → ดึง error message จาก response
      let msg = error.message || String(error);
      try {
        const ctx = await error.context?.json?.();
        if (ctx?.error) msg = ctx.error;
      } catch (_) {}
      if (msg.includes("Failed to send") || msg.includes("not found") || msg.includes("404")) {
        throw new Error("ยังไม่ได้ deploy Edge Function 'delete-user' (ดูคู่มือใน supabase/functions/delete-user/index.ts)");
      }
      throw new Error(msg);
    }
    return data;
  },
  // สร้างผู้ใช้ใหม่ — ใช้ client ชั่วคราว เพื่อไม่ให้ session ของแอดมินถูกแทนที่
  async createUser({ email, password, name, role, studentCode, grade }) {
    if (!window.PF_SUPABASE_READY) return null;
    const tmp = supabase.createClient(window.PF_SUPABASE_URL, window.PF_SUPABASE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await tmp.auth.signUp({
      email, password,
      options: { data: { name, role, student_code: studentCode || null, grade: grade || null } },
    });
    if (error) throw error;
    return data;
  },
};

const PfAssignments = {
  async list() {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('assignments')
      .select('*, teacher:teacher_id(id,name,email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async listWithSubmissions() {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('assignments')
      .select('*, teacher:teacher_id(id,name,email), evidence_items(id,student_id,status,created_at,student:student_id(name,student_code,grade))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async save({ id, teacherId, title, description, dueDate, targetGrade, core, spec, status }) {
    if (!_pf()) return null;
    const row = {
      title, description: description || null,
      due_date: dueDate || null,
      target_grade: targetGrade || null,
      core_competencies: core || [],
      spec_competencies: spec || [],
      status: status || 'open',
    };
    if (id) {
      const { error } = await _pf().from('assignments').update(row).eq('id', id);
      if (error) throw error;
    } else {
      row.teacher_id = teacherId;
      const { data, error } = await _pf().from('assignments').insert(row).select().single();
      if (error) throw error;
      return data;
    }
  },
  async remove(id) {
    if (!_pf()) return null;
    const { error } = await _pf().from('assignments').delete().eq('id', id);
    if (error) throw error;
  },
  async setStatus(id, status) {
    if (!_pf()) return null;
    const { error } = await _pf().from('assignments').update({ status }).eq('id', id);
    if (error) throw error;
  },
};

const PfEvidence = {
  async listMine(studentId) {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('evidence_items')
      .select('*, evidence_drive_links(*), evaluations(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async listForReview() {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('evidence_items')
      .select('*, evidence_drive_links(*), evaluations(*), student:student_id(id,name,nick,student_code,grade)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async create({ studentId, title, kind, date, core, spec, reflection, driveLinks, assignedTeacherId, assignmentId }) {
    if (!_pf()) return null;
    const { data: ev, error } = await _pf()
      .from('evidence_items')
      .insert({
        student_id: studentId, title, kind, date,
        assigned_teacher_id: assignedTeacherId || null,
        assignment_id: assignmentId || null,
        core_competencies: core || [], spec_competencies: spec || [],
        reflection, status: 'pending',
      })
      .select().single();
    if (error) throw error;
    const links = (driveLinks || []).filter(Boolean);
    if (links.length) {
      const { error: e2 } = await _pf().from('evidence_drive_links')
        .insert(links.map(url => ({ evidence_id: ev.id, url })));
      if (e2) throw e2;
    }
    return ev;
  },
  async setStatus(id, status) {
    if (!_pf()) return null;
    const { error } = await _pf().from('evidence_items').update({ status }).eq('id', id);
    if (error) throw error;
  },
  // ลบหลักฐานของตัวเอง (CASCADE จะลบ drive_links + evaluations ตาม)
  async remove(id) {
    if (!_pf()) return null;
    const { error } = await _pf().from('evidence_items').delete().eq('id', id);
    if (error) throw error;
  },
};

const PfEvaluations = {
  async save({ evidenceId, studentId, evaluatorId, score, status, comment, subLevels }) {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('evaluations')
      .insert({
        evidence_id: evidenceId, student_id: studentId, evaluator_id: evaluatorId,
        score, status, comment, sub_levels: subLevels || {},
      })
      .select().single();
    if (error) throw error;
    const evStatus = status === 'approve' ? 'approved' : status === 'reject' ? 'revise' : 'revise';
    await _pf().from('evidence_items').update({ status: evStatus }).eq('id', evidenceId);
    return data;
  },
};

const PfInternship = {
  async sites() {
    if (!_pf()) return null;
    const { data, error } = await _pf().from('internship_sites').select('*').order('id');
    if (error) throw error;
    return data;
  },
  async periods() {
    if (!_pf()) return null;
    const { data, error } = await _pf().from('internship_periods').select('*').order('id');
    if (error) throw error;
    return data;
  },
  async applications() {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('internship_applications').select('*').order('applied_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async apply({ studentId, studentName, siteId, periodId }) {
    if (!_pf()) return null;
    const { data, error } = await _pf()
      .from('internship_applications')
      .insert({ student_id: studentId, student_name: studentName,
                site_id: siteId, period_id: periodId, status: 'pending' })
      .select().single();
    if (error) throw error;
    return data;
  },
  async setStatus(id, status) {
    if (!_pf()) return null;
    const { error } = await _pf()
      .from('internship_applications').update({ status }).eq('id', id);
    if (error) throw error;
  },
  async saveSite(site) {
    if (!_pf()) return null;
    const { error } = await _pf().from('internship_sites').upsert(site);
    if (error) throw error;
  },
  async deleteSite(id) {
    if (!_pf()) return null;
    const { error } = await _pf().from('internship_sites').delete().eq('id', id);
    if (error) throw error;
  },
  async savePeriod(period) {
    if (!_pf()) return null;
    const { error } = await _pf().from('internship_periods').upsert(period);
    if (error) throw error;
  },
};

// รายวิชาที่นักเรียนกรอกได้ (จัดกลุ่มตามกลุ่มสาระ)
const GRADE_SUBJECTS = [
  { key: "biology",       label: "ชีววิทยา",              short: "ชีววิทยา",     group: "วิทยาศาสตร์" },
  { key: "chemistry",     label: "เคมี",                   short: "เคมี",         group: "วิทยาศาสตร์" },
  { key: "physics_astro", label: "ฟิสิกส์และดาราศาสตร์",     short: "ฟิสิกส์/ดารา", group: "วิทยาศาสตร์" },
  { key: "math_basic",    label: "คณิตศาสตร์พื้นฐาน",        short: "คณิต พื้นฐาน", group: "คณิตศาสตร์" },
  { key: "math_extra",    label: "คณิตศาสตร์เพิ่มเติม",       short: "คณิต เพิ่มเติม", group: "คณิตศาสตร์" },
  { key: "english_basic", label: "ภาษาอังกฤษพื้นฐาน",       short: "อังกฤษ พื้นฐาน", group: "ภาษาต่างประเทศ" },
  { key: "english_extra", label: "ภาษาอังกฤษเพิ่มเติม",      short: "อังกฤษ เพิ่มเติม", group: "ภาษาต่างประเทศ" },
];
window.GRADE_SUBJECTS = GRADE_SUBJECTS;

// กลุ่มสาระ → รายวิชาในกลุ่ม (สำหรับ render UI แบบ group)
const GRADE_SUBJECT_GROUPS = [
  { name: "วิทยาศาสตร์",       keys: ["biology","chemistry","physics_astro"] },
  { name: "คณิตศาสตร์",        keys: ["math_basic","math_extra"] },
  { name: "ภาษาต่างประเทศ",     keys: ["english_basic","english_extra"] },
];
window.GRADE_SUBJECT_GROUPS = GRADE_SUBJECT_GROUPS;

const PfGrades = {
  async listByStudent(studentId) {
    if (!_pf()) return [];
    const { data, error } = await _pf().from('student_grades').select('*')
      .eq('student_id', studentId).order('semester');
    if (error) throw error;
    return data || [];
  },
  async save(studentId, semester, subject, grade) {
    if (!_pf()) return null;
    const { error } = await _pf().from('student_grades').upsert({
      student_id: studentId, semester, subject, grade,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,semester,subject' });
    if (error) throw error;
  },
  async removeSemester(studentId, semester) {
    if (!_pf()) return null;
    const { error } = await _pf().from('student_grades').delete()
      .eq('student_id', studentId).eq('semester', semester);
    if (error) throw error;
  },
  // คืน { semester → {gpa, math, biology, ...} } จาก rows ใน DB
  groupBySemester(rows) {
    const m = {};
    (rows || []).forEach(r => {
      if (!m[r.semester]) m[r.semester] = {};
      m[r.semester][r.subject] = Number(r.grade);
    });
    return m;
  },
  // คืน { subject → ค่าเฉลี่ย }
  averagesBySubject(rows) {
    const buckets = {};
    (rows || []).forEach(r => {
      if (r.grade == null) return;
      (buckets[r.subject] = buckets[r.subject] || []).push(Number(r.grade));
    });
    const avg = {};
    Object.entries(buckets).forEach(([sub, arr]) => {
      avg[sub] = arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : null;
    });
    return avg;
  },
};

// ประเภทกิจกรรม + สี/ป้ายแสดง
const ACTIVITY_CATEGORIES = [
  { key: "research",     label: "งานวิจัย",       color: "green",  dot: "dot-green"  },
  { key: "presentation", label: "การนำเสนอ",     color: "blue",   dot: "dot-blue"   },
  { key: "camp",         label: "ค่าย/สหกิจ",     color: "pink",   dot: "dot-pink"   },
  { key: "workshop",     label: "อบรม/Workshop", color: "purple", dot: "dot-purple" },
  { key: "other",        label: "อื่นๆ",          color: "gray",   dot: "dot-gray"   },
];
window.ACTIVITY_CATEGORIES = ACTIVITY_CATEGORIES;

const PfActivities = {
  async list() {
    if (!_pf()) return [];
    const { data, error } = await _pf()
      .from('activities')
      .select('*, activity_registrations(student_id)')
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async save({ id, title, description, category, date, timeStart, timeEnd, location, cap, status }) {
    if (!_pf()) return null;
    const row = {
      title, description: description || null,
      category: category || 'other',
      date, time_start: timeStart || null, time_end: timeEnd || null,
      location: location || null,
      cap: cap != null && cap !== "" ? +cap : null,
      status: status || 'open',
      updated_at: new Date().toISOString(),
    };
    if (id) {
      const { error } = await _pf().from('activities').update(row).eq('id', id);
      if (error) throw error;
    } else {
      row.created_by = window.pfCurrentUser ? window.pfCurrentUser.id : null;
      const { error } = await _pf().from('activities').insert(row);
      if (error) throw error;
    }
  },
  async remove(id) {
    if (!_pf()) return null;
    const { error } = await _pf().from('activities').delete().eq('id', id);
    if (error) throw error;
  },
  async register(activityId, studentId) {
    if (!_pf()) return null;
    const { error } = await _pf().from('activity_registrations').insert({
      activity_id: activityId, student_id: studentId,
    });
    if (error) throw error;
  },
  async unregister(activityId, studentId) {
    if (!_pf()) return null;
    const { error } = await _pf().from('activity_registrations').delete()
      .eq('activity_id', activityId).eq('student_id', studentId);
    if (error) throw error;
  },
  // จำนวนผู้ลงทะเบียนจริง — embed array จาก list()
  countRegistered(act) {
    return (act.activity_registrations || []).length;
  },
  isRegistered(act, studentId) {
    return (act.activity_registrations || []).some(r => r.student_id === studentId);
  },
};
window.PfActivities = PfActivities;

// ประเภทข้อสอบภาษาอังกฤษที่รองรับ
const ENGLISH_EXAM_TYPES = [
  { key: "ielts",  label: "IELTS",  max: 9,   step: 0.5,  hint: "0–9" },
  { key: "toefl",  label: "TOEFL",  max: 120, step: 1,    hint: "0–120 (iBT)" },
  { key: "cutep",  label: "CUTEP",  max: 120, step: 1,    hint: "0–120" },
];
window.ENGLISH_EXAM_TYPES = ENGLISH_EXAM_TYPES;

const PfEnglishExams = {
  async listByStudent(studentId) {
    if (!_pf()) return [];
    const { data, error } = await _pf().from('student_english_exams').select('*')
      .eq('student_id', studentId).order('exam_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async save({ id, studentId, examType, score, examDate, notes }) {
    if (!_pf()) return null;
    const row = {
      student_id: studentId, exam_type: examType,
      score: score != null && score !== "" ? +score : null,
      exam_date: examDate || null, notes: notes || null,
      updated_at: new Date().toISOString(),
    };
    if (id) {
      const { error } = await _pf().from('student_english_exams').update(row).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await _pf().from('student_english_exams').insert(row);
      if (error) throw error;
    }
  },
  async remove(id) {
    if (!_pf()) return null;
    const { error } = await _pf().from('student_english_exams').delete().eq('id', id);
    if (error) throw error;
  },
};

const PfRubrics = {
  async list() {
    if (!_pf()) return [];
    const { data, error } = await _pf().from('rubric_overrides').select('*');
    if (error) throw error;
    return data || [];
  },
  async save(key, data) {
    if (!_pf()) return null;
    const { error } = await _pf().from('rubric_overrides').upsert({
      key, data, updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },
  async reset(key) {
    if (!_pf()) return null;
    const { error } = await _pf().from('rubric_overrides').delete().eq('key', key);
    if (error) throw error;
  },
};

// คำนวณระดับสมรรถนะของนักเรียนจาก evaluations ใน DB
// คืน { key → ระดับเฉลี่ย 1-5, ปัดเศษ }
async function computeMyLevels(studentId) {
  if (!window.PfEvidence) return {};
  let rows;
  try { rows = await window.PfEvidence.listMine(studentId); }
  catch (e) { return {}; }
  const fullToKey = {};
  [...(window.CORE_COMPETENCIES||[]), ...(window.SPEC_COMPETENCIES||[])]
    .forEach(c => { fullToKey[c.full] = c.key; });
  const buckets = {};
  (rows || []).forEach(ev => {
    const comps = [...(ev.core_competencies||[]), ...(ev.spec_competencies||[])];
    const evals = (ev.evaluations || []).map(e => e.score).filter(s => s != null);
    if (!evals.length) return;
    const avg = evals.reduce((a,b)=>a+b,0) / evals.length;
    comps.forEach(full => {
      const key = fullToKey[full];
      if (!key) return;
      (buckets[key] = buckets[key] || []).push(avg);
    });
  });
  const out = {};
  Object.entries(buckets).forEach(([k, arr]) => {
    out[k] = Math.round(arr.reduce((a,b)=>a+b,0) / arr.length);
  });
  return out;
}

// ดึง override จาก DB แล้ว merge ลง CORE/SPEC_COMPETENCIES ในที่
// (เพื่อให้ทุกหน้าเห็นรูบริกฉบับที่แอดมินแก้)
async function applyRubricOverrides() {
  if (!window.PfRubrics) return;
  try {
    const rows = await window.PfRubrics.list();
    if (!rows || !rows.length) return;
    const map = {}; rows.forEach(r => { map[r.key] = r.data; });
    const apply = (arr) => arr && arr.forEach(c => { if (map[c.key]) Object.assign(c, map[c.key]); });
    apply(window.CORE_COMPETENCIES);
    apply(window.SPEC_COMPETENCIES);
  } catch (e) { /* ignore */ }
}

Object.assign(window, { PfUsers, PfAssignments, PfEvidence, PfEvaluations, PfInternship, PfRubrics, PfGrades, PfEnglishExams, applyRubricOverrides, computeMyLevels });

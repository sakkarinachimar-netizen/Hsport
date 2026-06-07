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
  async create({ studentId, title, kind, date, core, spec, reflection, driveLinks, assignedTeacherId }) {
    if (!_pf()) return null;
    const { data: ev, error } = await _pf()
      .from('evidence_items')
      .insert({
        student_id: studentId, title, kind, date,
        assigned_teacher_id: assignedTeacherId || null,
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

Object.assign(window, { PfUsers, PfEvidence, PfEvaluations, PfInternship, PfRubrics, applyRubricOverrides });

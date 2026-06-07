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
  // ลบแถวใน public.users (ระงับสิทธิ์เข้าใช้ระบบ)
  // หมายเหตุ: auth.users ยังคงอยู่ — ต้องลบจาก Supabase Dashboard ถ้าต้องการลบทั้งหมด
  async remove(id) {
    if (!_pf()) return null;
    const { error } = await _pf().from('users').delete().eq('id', id);
    if (error) throw error;
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
  async create({ studentId, title, kind, date, core, spec, reflection, driveLinks }) {
    if (!_pf()) return null;
    const { data: ev, error } = await _pf()
      .from('evidence_items')
      .insert({
        student_id: studentId, title, kind, date,
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

Object.assign(window, { PfUsers, PfEvidence, PfEvaluations, PfInternship });

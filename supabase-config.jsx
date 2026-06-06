/* supabase-config.jsx — standalone portfolio backend
   project: kmkbzdpwcsqwghkxxpst (portfolio เท่านั้น ไม่เกี่ยวกับ HSresearch) */

const PF_SUPABASE_URL  = 'https://kmkbzdpwcsqwghkxxpst.supabase.co';
const PF_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2J6ZHB3Y3Nxd2doa3h4cHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY5NDAsImV4cCI6MjA5NDU4Mjk0MH0.AZKPxK0ZTDgfEw-jr9bqVRgRhxUynBLl2yckr-rGV9w';

window.PF_SUPABASE_READY = typeof supabase !== 'undefined';
window.PF_SUPABASE_URL = PF_SUPABASE_URL;
window.PF_SUPABASE_ANON = PF_SUPABASE_ANON;
const pfdb = window.PF_SUPABASE_READY
  ? supabase.createClient(PF_SUPABASE_URL, PF_SUPABASE_ANON)
  : null;
window.pfdb = pfdb;

const PfAuth = {
  available() { return !!pfdb; },
  async signIn(email, password) {
    const { data, error } = await pfdb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() { if (pfdb) await pfdb.auth.signOut(); },

  // ส่งอีเมลลิงก์รีเซ็ตรหัสผ่าน
  async resetPassword(email) {
    if (!pfdb) throw new Error("ระบบออฟไลน์");
    const { error } = await pfdb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) throw error;
  },

  // ตั้งรหัสผ่านใหม่ (ใช้ตอนอยู่ใน session ปกติ หรือ recovery)
  async updatePassword(newPassword) {
    if (!pfdb) throw new Error("ระบบออฟไลน์");
    const { error } = await pfdb.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  async getSession() {
    if (!pfdb) return null;
    const { data } = await pfdb.auth.getSession();
    return data.session;
  },
  async getProfile() {
    if (!pfdb) return null;
    const { data: { user } } = await pfdb.auth.getUser();
    if (!user) return null;
    const { data } = await pfdb.from('users').select('*').eq('id', user.id).single();
    return data;
  },
  onAuthChange(cb) {
    if (!pfdb) return { data: { subscription: { unsubscribe() {} } } };
    return pfdb.auth.onAuthStateChange(cb);
  },
};
window.PfAuth = PfAuth;

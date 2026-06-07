-- ============================================================
--  PDSHS e-Portfolio — Supabase Schema (STANDALONE portfolio DB)
--  รันใน SQL Editor ของ project: kmkbzdpwcsqwghkxxpst เท่านั้น
--  ระบบนี้เป็นของ portfolio ล้วน ไม่เกี่ยวกับ HSresearch
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Clean slate ─────────────────────────────────────────────
-- ล้างตารางของ portfolio ที่ค้างจากการทดลองก่อนหน้า (ถ้ามี)
-- ปลอดภัยใน project dev ที่ยังไม่มีข้อมูลจริง
-- ไม่แตะตารางของ Supabase Auth (auth.users)
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS internship_periods      CASCADE;
DROP TABLE IF EXISTS internship_sites        CASCADE;
DROP TABLE IF EXISTS evaluations             CASCADE;
DROP TABLE IF EXISTS evidence_drive_links    CASCADE;
DROP TABLE IF EXISTS evidence_items          CASCADE;
DROP TABLE IF EXISTS users                   CASCADE;
DROP FUNCTION IF EXISTS is_evaluator()       CASCADE;
DROP FUNCTION IF EXISTS is_staff()           CASCADE;
DROP FUNCTION IF EXISTS current_user_role()  CASCADE;

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  nick          TEXT,
  role          TEXT NOT NULL CHECK (role IN ('student','teacher','admin')),
  student_code  TEXT,
  grade         TEXT,
  avatar_color  TEXT DEFAULT '#6366f1',
  advisor_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Evidence (แฟ้มสะสมผลงาน) ────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_teacher_id UUID REFERENCES users(id),
  title         TEXT NOT NULL,
  kind          TEXT,
  date          DATE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','revise')),
  core_competencies TEXT[] DEFAULT '{}',
  spec_competencies TEXT[] DEFAULT '{}',
  reflection    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_drive_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id   UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  label         TEXT
);

CREATE TABLE IF NOT EXISTS evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id   UUID REFERENCES evidence_items(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id  UUID REFERENCES users(id),
  score         NUMERIC(2,1) CHECK (score BETWEEN 1 AND 5),
  status        TEXT CHECK (status IN ('approve','revise','reject')),
  comment       TEXT,
  sub_levels    JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Internship sites (ตรงโครง mock ใน internship.jsx) ───────
CREATE TABLE IF NOT EXISTS internship_sites (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  dept      TEXT,
  area      TEXT,
  field     TEXT,
  cap       INTEGER DEFAULT 0,
  taken     INTEGER DEFAULT 0,
  descr     TEXT,
  skills    TEXT[] DEFAULT '{}',
  tag       TEXT CHECK (tag IN ('hospital','lab','gov')),
  status    TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','full','closed')),
  start_date    DATE,
  end_date      DATE,
  hours_per_day NUMERIC(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internship_periods (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  label         TEXT,
  start_date    TEXT,
  end_date      TEXT,
  weeks         INTEGER,
  time_start    TEXT,
  time_end      TEXT,
  days          TEXT,
  hours_per_day NUMERIC(3,1),
  open          BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internship_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name    TEXT,
  site_id         TEXT REFERENCES internship_sites(id),
  period_id       TEXT REFERENCES internship_periods(id),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  advisor         TEXT,
  reflection_done BOOLEAN DEFAULT FALSE,
  evaluated       BOOLEAN DEFAULT FALSE,
  score           NUMERIC(2,1),
  applied_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  Row Level Security
-- ============================================================
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_drive_links    ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_sites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_periods      ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$ SELECT role FROM users WHERE id = auth.uid() $$
LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$ SELECT current_user_role() IN ('teacher','admin') $$
LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "users_update_self" ON users;
CREATE POLICY "users_update_self" ON users FOR UPDATE
  USING (id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "users_admin_write" ON users;
CREATE POLICY "users_admin_write" ON users FOR ALL
  USING (current_user_role() = 'admin');

DROP POLICY IF EXISTS "evidence_select" ON evidence_items;
CREATE POLICY "evidence_select" ON evidence_items FOR SELECT
  USING (
    student_id = auth.uid()
    OR current_user_role() = 'admin'
    OR (current_user_role() = 'teacher' AND assigned_teacher_id = auth.uid())
  );
DROP POLICY IF EXISTS "evidence_insert" ON evidence_items;
CREATE POLICY "evidence_insert" ON evidence_items FOR INSERT
  WITH CHECK (student_id = auth.uid() AND current_user_role() = 'student');
DROP POLICY IF EXISTS "evidence_update" ON evidence_items;
CREATE POLICY "evidence_update" ON evidence_items FOR UPDATE
  USING (
    student_id = auth.uid()
    OR current_user_role() = 'admin'
    OR (current_user_role() = 'teacher' AND assigned_teacher_id = auth.uid())
  );
DROP POLICY IF EXISTS "evidence_delete" ON evidence_items;
CREATE POLICY "evidence_delete" ON evidence_items FOR DELETE
  USING (student_id = auth.uid() OR current_user_role() = 'admin');

DROP POLICY IF EXISTS "drive_select" ON evidence_drive_links;
CREATE POLICY "drive_select" ON evidence_drive_links FOR SELECT
  USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "drive_write" ON evidence_drive_links;
CREATE POLICY "drive_write" ON evidence_drive_links FOR ALL
  USING (EXISTS (SELECT 1 FROM evidence_items e
                 WHERE e.id = evidence_id
                   AND (e.student_id = auth.uid() OR is_staff())));

DROP POLICY IF EXISTS "eval_select" ON evaluations;
CREATE POLICY "eval_select" ON evaluations FOR SELECT
  USING (student_id = auth.uid() OR is_staff());
DROP POLICY IF EXISTS "eval_write" ON evaluations;
CREATE POLICY "eval_write" ON evaluations FOR ALL USING (is_staff());

DROP POLICY IF EXISTS "sites_select" ON internship_sites;
CREATE POLICY "sites_select" ON internship_sites FOR SELECT
  USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "sites_manage" ON internship_sites;
CREATE POLICY "sites_manage" ON internship_sites FOR ALL
  USING (current_user_role() = 'admin');

DROP POLICY IF EXISTS "periods_select" ON internship_periods;
CREATE POLICY "periods_select" ON internship_periods FOR SELECT
  USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "periods_manage" ON internship_periods;
CREATE POLICY "periods_manage" ON internship_periods FOR ALL
  USING (current_user_role() = 'admin');

DROP POLICY IF EXISTS "appl_select" ON internship_applications;
CREATE POLICY "appl_select" ON internship_applications FOR SELECT
  USING (student_id = auth.uid() OR is_staff());
DROP POLICY IF EXISTS "appl_insert" ON internship_applications;
CREATE POLICY "appl_insert" ON internship_applications FOR INSERT
  WITH CHECK (student_id = auth.uid() AND current_user_role() = 'student');
DROP POLICY IF EXISTS "appl_update" ON internship_applications;
CREATE POLICY "appl_update" ON internship_applications FOR UPDATE
  USING (is_staff());

-- ============================================================
--  Seed: internship sites + periods (ข้อมูลตั้งต้น แอดมินแก้ได้)
-- ============================================================
INSERT INTO internship_sites (id,name,dept,area,field,cap,taken,descr,skills,tag,status) VALUES
 ('s1','โรงพยาบาลจุฬาลงกรณ์','แผนกพยาธิวิทยา','กรุงเทพฯ','การแพทย์',4,2,'ฝึกในห้องปฏิบัติการพยาธิวิทยา เรียนรู้การตรวจชิ้นเนื้อ การย้อมสี การวิเคราะห์เซลล์',ARRAY['ใฝ่รู้และสืบเสาะ','การคิดขั้นสูง'],'hospital','open'),
 ('s2','โรงพยาบาลศิริราช','แผนกเภสัชกรรม','กรุงเทพฯ','เภสัชกรรม',3,1,'เรียนรู้กระบวนการจ่ายยา การให้คำปรึกษาผู้ป่วย ระบบเฝ้าระวังอาการไม่พึงประสงค์',ARRAY['การเข้าอกเข้าใจผู้อื่น','จริยธรรมและความรับผิดชอบ'],'hospital','open'),
 ('s3','ศูนย์วิทยาศาสตร์การแพทย์ที่ 1','ห้องปฏิบัติการอณูชีววิทยา','นนทบุรี','ห้องปฏิบัติการ',6,6,'เทคนิคทางอณูชีววิทยา PCR sequencing การวิเคราะห์เชิงโมเลกุลของเชื้อก่อโรค',ARRAY['ใฝ่รู้และสืบเสาะ','การคิดขั้นสูง'],'lab','full'),
 ('s4','ห้องปฏิบัติการชีวเคมี คณะวิทยาศาสตร์ จุฬาฯ','ภาควิชาชีวเคมี','กรุงเทพฯ','ห้องปฏิบัติการ',4,1,'ฝึกเทคนิคโครมาโทกราฟี เอนไซม์แอสเซย์ การทำงานในห้องวิจัยจริง',ARRAY['ใฝ่รู้และสืบเสาะ','ยืดหยุ่นและปรับตัว'],'lab','open'),
 ('s5','กรมวิทยาศาสตร์การแพทย์','สำนักคุ้มครองผู้บริโภค','นนทบุรี','สาธารณสุข',3,0,'การตรวจวิเคราะห์คุณภาพผลิตภัณฑ์สุขภาพ การประกันคุณภาพห้องปฏิบัติการ',ARRAY['จริยธรรมและความรับผิดชอบ','การคิดขั้นสูง'],'gov','open'),
 ('s6','โรงพยาบาลรามาธิบดี','งานบริการพยาธิวิทยาคลินิก','กรุงเทพฯ','การแพทย์',4,3,'ฝึกการตรวจเลือด ปัสสาวะ เคมีคลินิก จุลชีววิทยาคลินิก',ARRAY['การคิดขั้นสูง','ใฝ่รู้และสืบเสาะ'],'hospital','open'),
 ('s7','ห้องปฏิบัติการชีวโมเลกุล มศว','คณะแพทยศาสตร์','กรุงเทพฯ','ห้องปฏิบัติการ',5,2,'เทคนิคปฏิบัติการในงานวิจัยทางการแพทย์ การออกแบบและรันการทดลอง',ARRAY['ใฝ่รู้และสืบเสาะ','ยืดหยุ่นและปรับตัว'],'lab','open'),
 ('s8','ศูนย์การแพทย์สมเด็จพระเทพรัตน์','งานเวชสารสนเทศ','กรุงเทพฯ','การแพทย์',2,0,'ระบบข้อมูลสุขภาพ การจัดเก็บข้อมูลผู้ป่วย ระบบ HIS',ARRAY['จริยธรรมและความรับผิดชอบ','การจัดการตนเอง'],'hospital','open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO internship_periods (id,name,label,start_date,end_date,weeks,time_start,time_end,days,hours_per_day,open) VALUES
 ('p1','ฤดูร้อน 2568','ภาคฤดูร้อน (มี.ค.–เม.ย. 2568)','2568-03-15','2568-04-12',4,'08:30','16:30','จ.–ศ.',8,TRUE),
 ('p2','ปิดเทอม 1 ปี 2568','ปิดภาคเรียนที่ 1 (ต.ค. 2568)','2568-10-06','2568-10-20',2,'09:00','16:00','จ.–ศ.',7,TRUE),
 ('p3','ปิดเทอม 2 ปี 2568','ปิดภาคเรียนที่ 2 (มี.ค. 2569)','2569-03-10','2569-03-24',2,'09:00','16:00','จ.–ศ.',7,FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
--  Auto-provision profile + role เมื่อมีการสมัคร/สร้าง user
--  (เมื่อเพิ่ม user ใน Supabase Auth → สร้างแถวใน public.users ให้อัตโนมัติ)
--  role อ่านจาก metadata ตอนสร้าง ถ้าไม่ระบุ/ไม่ถูกต้อง → 'student'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
BEGIN
  IF v_role NOT IN ('student','teacher','admin') THEN
    v_role := 'student';
  END IF;
  INSERT INTO public.users (id, email, name, role, student_code, nick, grade)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role,
    NEW.raw_user_meta_data->>'student_code',
    NEW.raw_user_meta_data->>'nick',
    NEW.raw_user_meta_data->>'grade'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── ปิดช่องโหว่: ห้ามผู้ใช้แก้ role ตัวเอง (เฉพาะ admin เปลี่ยน role ได้) ──
CREATE OR REPLACE FUNCTION public.guard_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(current_user_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'only admin can change role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_role ON public.users;
CREATE TRIGGER trg_guard_role
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_role_change();

-- ── Rubric overrides — แอดมินแก้รูบริกได้ ──
CREATE TABLE IF NOT EXISTS rubric_overrides (
  key         TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE rubric_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rubric_select" ON rubric_overrides;
CREATE POLICY "rubric_select" ON rubric_overrides FOR SELECT
  USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "rubric_manage" ON rubric_overrides;
CREATE POLICY "rubric_manage" ON rubric_overrides FOR ALL
  USING (current_user_role() = 'admin');

-- ============================================================
--  PDSHS e-Portfolio — Roles & user provisioning (ADDITIVE)
--  รันไฟล์นี้ได้ "โดยไม่ลบข้อมูล" — ใช้กรณีรัน schema.sql ไปแล้ว
--  project: kmkbzdpwcsqwghkxxpst เท่านั้น
-- ============================================================
--  บทบาทที่ระบบรองรับ (คอลัมน์ users.role):
--    'student' = นักเรียน
--    'teacher' = อาจารย์ที่ปรึกษา / ผู้ประเมิน
--    'admin'   = ผู้ดูแลระบบ
-- ============================================================

-- ── 1) Trigger: สร้างโปรไฟล์ + role อัตโนมัติเมื่อมีการสร้าง user ──
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

-- ── 2) Backfill: user ที่สร้างไว้ "ก่อน" มี trigger (ยังไม่มีโปรไฟล์) ──
--    → สร้างแถว public.users ให้ครบ เพื่อให้ล็อกอินเข้าได้
INSERT INTO public.users (id, email, name, role)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
       CASE WHEN COALESCE(u.raw_user_meta_data->>'role','student') IN ('student','teacher','admin')
            THEN u.raw_user_meta_data->>'role' ELSE 'student' END
FROM auth.users u
LEFT JOIN public.users p ON p.id = u.id
WHERE p.id IS NULL;

-- ── 3) กำหนด/แก้บทบาทรายคน (แก้อีเมลให้ตรง แล้วรันเฉพาะบรรทัดที่ต้องใช้) ──
-- ผู้ดูแลระบบ:
--   UPDATE public.users SET role='admin', name='ชื่อผู้ดูแล'
--     WHERE email='admin@pdshs.ac.th';
-- อาจารย์ที่ปรึกษา/ผู้ประเมิน:
--   UPDATE public.users SET role='teacher', name='อ. ชื่อ-สกุล'
--     WHERE email='teacher@pdshs.ac.th';
-- นักเรียน (ใส่รหัส/ชั้นเพิ่มได้):
--   UPDATE public.users SET role='student', name='ชื่อ-สกุล',
--     student_code='65001234', grade='ม.6'
--     WHERE email='student@pdshs.ac.th';

-- ── 4) ปิดช่องโหว่: ห้ามผู้ใช้แก้ role ตัวเอง (เฉพาะ admin เปลี่ยน role ได้) ──
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

-- ── 5) ตรวจรายชื่อผู้ใช้ + บทบาทปัจจุบัน ──
-- SELECT email, name, role, student_code, grade FROM public.users ORDER BY role, email;

-- ── 6.7) Trigger อัปเดต taken + status ของสถานที่ฝึกงานอัตโนมัติ ──
-- เมื่อมีนักเรียนสมัคร/ถูกปฏิเสธ/ลบใบสมัคร → คำนวณใหม่ทันที
-- นับเฉพาะใบสมัครสถานะ pending/approved (rejected ไม่เอามานับ)
-- ถ้า taken ≥ cap → ปิดรับอัตโนมัติ (status='full')
-- ถ้าแอดมินสั่ง closed ไว้เอง → คงสถานะ closed ไม่ override
CREATE OR REPLACE FUNCTION public.recalc_site_taken()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  affected_ids TEXT[] := ARRAY[]::TEXT[];
  sid TEXT;
  c INT;
  s_cap INT;
  s_status TEXT;
  new_status TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected_ids := ARRAY[OLD.site_id];
  ELSIF TG_OP = 'UPDATE' THEN
    affected_ids := ARRAY[OLD.site_id, NEW.site_id];
  ELSE  -- INSERT
    affected_ids := ARRAY[NEW.site_id];
  END IF;

  FOREACH sid IN ARRAY affected_ids LOOP
    IF sid IS NULL THEN CONTINUE; END IF;
    SELECT COUNT(*) INTO c FROM internship_applications
      WHERE site_id = sid AND status IN ('pending','approved');
    SELECT cap, status INTO s_cap, s_status FROM internship_sites WHERE id = sid;
    IF s_status = 'closed' THEN
      new_status := 'closed';  -- คงค่า manual close ไว้
    ELSIF c >= COALESCE(s_cap, 0) AND COALESCE(s_cap, 0) > 0 THEN
      new_status := 'full';
    ELSE
      new_status := 'open';
    END IF;
    UPDATE internship_sites SET taken = c, status = new_status WHERE id = sid;
  END LOOP;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_taken ON internship_applications;
CREATE TRIGGER trg_recalc_taken
  AFTER INSERT OR UPDATE OR DELETE ON internship_applications
  FOR EACH ROW EXECUTE FUNCTION public.recalc_site_taken();

-- One-time backfill: ซิงก์ taken/status ของทุก site ให้ตรงข้อมูลปัจจุบัน
UPDATE internship_sites s
SET taken = COALESCE(c.cnt, 0),
    status = CASE
      WHEN s.status = 'closed' THEN 'closed'
      WHEN COALESCE(c.cnt, 0) >= COALESCE(s.cap, 0) AND COALESCE(s.cap, 0) > 0 THEN 'full'
      ELSE 'open'
    END
FROM (
  SELECT site_id, COUNT(*) AS cnt
  FROM internship_applications
  WHERE status IN ('pending','approved')
  GROUP BY site_id
) c
WHERE s.id = c.site_id
   OR s.id NOT IN (SELECT site_id FROM internship_applications WHERE status IN ('pending','approved'));

-- ── 6.5) เพิ่มฟิลด์วันที่ + ชั่วโมง/วัน ให้สถานที่ฝึกงาน ──
ALTER TABLE internship_sites
  ADD COLUMN IF NOT EXISTS start_date    DATE,
  ADD COLUMN IF NOT EXISTS end_date      DATE,
  ADD COLUMN IF NOT EXISTS hours_per_day NUMERIC(3,1);

-- ── 6) Assign teacher ให้ evidence + RLS ใหม่ ──
-- นักเรียนเลือกอาจารย์ตอนส่งหลักฐาน → อาจารย์เห็นเฉพาะที่ถูกมอบหมายให้ตน
ALTER TABLE evidence_items
  ADD COLUMN IF NOT EXISTS assigned_teacher_id UUID REFERENCES users(id);

DROP POLICY IF EXISTS "evidence_select" ON evidence_items;
CREATE POLICY "evidence_select" ON evidence_items FOR SELECT
  USING (
    student_id = auth.uid()
    OR current_user_role() = 'admin'
    OR (current_user_role() = 'teacher' AND assigned_teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "evidence_update" ON evidence_items;
CREATE POLICY "evidence_update" ON evidence_items FOR UPDATE
  USING (
    student_id = auth.uid()
    OR current_user_role() = 'admin'
    OR (current_user_role() = 'teacher' AND assigned_teacher_id = auth.uid())
  );

-- ── 7) ตาราง override สำหรับรูบริก (แอดมินแก้ทับค่าเริ่มต้นจาก data.jsx ได้) ──
CREATE TABLE IF NOT EXISTS rubric_overrides (
  key         TEXT PRIMARY KEY,        -- ตรงกับ CORE/SPEC_COMPETENCIES.key
  data        JSONB NOT NULL,          -- เก็บ object รูบริกฉบับแก้แล้วทั้งก้อน
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rubric_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rubric_select" ON rubric_overrides;
CREATE POLICY "rubric_select" ON rubric_overrides FOR SELECT
  USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "rubric_manage" ON rubric_overrides;
CREATE POLICY "rubric_manage" ON rubric_overrides FOR ALL
  USING (current_user_role() = 'admin');

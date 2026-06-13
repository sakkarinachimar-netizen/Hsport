-- ============================================================
--  Migration: เพิ่มตาราง assignments + คอลัมน์ assignment_id
--  รันใน SQL Editor ของ Supabase project: kmkbzdpwcsqwghkxxpst
--  Additive — ไม่ drop / ไม่แก้ไขตารางเดิม
--  วันที่: 2026-06-13
-- ============================================================

-- 1) สร้างตาราง assignments
CREATE TABLE IF NOT EXISTS assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  due_date          DATE,
  target_grade      TEXT,
  core_competencies TEXT[] DEFAULT '{}',
  spec_competencies TEXT[] DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','closed')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2) เพิ่มคอลัมน์ assignment_id ใน evidence_items
ALTER TABLE evidence_items
  ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL;

-- 3) เปิด RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- 4) RLS policies
DROP POLICY IF EXISTS "assignments_select" ON assignments;
CREATE POLICY "assignments_select" ON assignments FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "assignments_insert" ON assignments;
CREATE POLICY "assignments_insert" ON assignments FOR INSERT
  WITH CHECK (is_staff());

DROP POLICY IF EXISTS "assignments_update" ON assignments;
CREATE POLICY "assignments_update" ON assignments FOR UPDATE
  USING (teacher_id = auth.uid() OR current_user_role() = 'admin');

DROP POLICY IF EXISTS "assignments_delete" ON assignments;
CREATE POLICY "assignments_delete" ON assignments FOR DELETE
  USING (teacher_id = auth.uid() OR current_user_role() = 'admin');

-- ============================================================
--  Migration: นักเรียนประเมินตนเอง + ครูประเมินสมรรถนะภาพรวมรายเทอม
--             + แนบหลักฐานจากฐานข้อมูลชิ้นงานที่ส่งแล้ว
--  รันใน SQL Editor ของ Supabase project: kmkbzdpwcsqwghkxxpst
--  Additive — ไม่ drop / ไม่แก้ไขตารางเดิม
--  วันที่: 2026-09-04
--  หมายเหตุ: ครูคนใดก็ได้ประเมินนักเรียนคนใดก็ได้ (ไม่จำกัดเฉพาะที่ปรึกษา)
-- ============================================================

-- 1) นักเรียนประเมินตนเอง (รายเทอม)
CREATE TABLE IF NOT EXISTS self_assessments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term          TEXT NOT NULL,               -- เช่น "1/2568"
  levels        JSONB NOT NULL DEFAULT '{}', -- { competency_key: 1-5 }
  note          TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, term)
);

-- 2) ครูประเมินสมรรถนะภาพรวมของนักเรียน (รายเทอม) — ครูคนใดก็ได้
CREATE TABLE IF NOT EXISTS term_evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id  UUID NOT NULL REFERENCES users(id),
  term          TEXT NOT NULL,
  levels        JSONB NOT NULL DEFAULT '{}',
  comment       TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, term)
);

-- 3) หลักฐานที่ครูแนบอ้างอิงประกอบการประเมินภาพรวม (ดึงจากชิ้นงานที่นักเรียนส่งแล้ว)
CREATE TABLE IF NOT EXISTS term_evaluation_evidence (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_evaluation_id  UUID NOT NULL REFERENCES term_evaluations(id) ON DELETE CASCADE,
  evidence_id         UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  competency_key      TEXT,   -- สมรรถนะที่หลักฐานชิ้นนี้อ้างอิง; NULL = อ้างอิงทั่วไป
  UNIQUE (term_evaluation_id, evidence_id, competency_key)
);

-- 4) เปิด RLS
ALTER TABLE self_assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_evaluations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_evaluation_evidence ENABLE ROW LEVEL SECURITY;

-- 5) RLS policies — self_assessments
DROP POLICY IF EXISTS "self_assessments_select" ON self_assessments;
CREATE POLICY "self_assessments_select" ON self_assessments FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "self_assessments_insert" ON self_assessments;
CREATE POLICY "self_assessments_insert" ON self_assessments FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "self_assessments_update" ON self_assessments;
CREATE POLICY "self_assessments_update" ON self_assessments FOR UPDATE
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "self_assessments_delete" ON self_assessments;
CREATE POLICY "self_assessments_delete" ON self_assessments FOR DELETE
  USING (student_id = auth.uid());

-- 6) RLS policies — term_evaluations (staff คนใดก็ได้ เขียน/แก้ไขได้)
DROP POLICY IF EXISTS "term_evaluations_select" ON term_evaluations;
CREATE POLICY "term_evaluations_select" ON term_evaluations FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "term_evaluations_insert" ON term_evaluations;
CREATE POLICY "term_evaluations_insert" ON term_evaluations FOR INSERT
  WITH CHECK (is_staff());

DROP POLICY IF EXISTS "term_evaluations_update" ON term_evaluations;
CREATE POLICY "term_evaluations_update" ON term_evaluations FOR UPDATE
  USING (is_staff());

DROP POLICY IF EXISTS "term_evaluations_delete" ON term_evaluations;
CREATE POLICY "term_evaluations_delete" ON term_evaluations FOR DELETE
  USING (is_staff());

-- 7) RLS policies — term_evaluation_evidence
DROP POLICY IF EXISTS "term_evaluation_evidence_select" ON term_evaluation_evidence;
CREATE POLICY "term_evaluation_evidence_select" ON term_evaluation_evidence FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "term_evaluation_evidence_insert" ON term_evaluation_evidence;
CREATE POLICY "term_evaluation_evidence_insert" ON term_evaluation_evidence FOR INSERT
  WITH CHECK (is_staff());

DROP POLICY IF EXISTS "term_evaluation_evidence_delete" ON term_evaluation_evidence;
CREATE POLICY "term_evaluation_evidence_delete" ON term_evaluation_evidence FOR DELETE
  USING (is_staff());

-- 8) ให้ staff (ครู/แอดมิน) อ่านชิ้นงานของนักเรียนทุกคนได้ (ไม่จำกัดเฉพาะที่ถูก assign)
--    evidence_items เดิมมี policy select อยู่แล้วสำหรับเจ้าของ/ครูที่ถูก assign เท่านั้น
--    เพิ่ม policy แยกให้ staff เห็นทั้งหมด (additive, ไม่ทับ policy เดิม) — ใช้ตอนแนบหลักฐาน
DROP POLICY IF EXISTS "evidence_items_select_staff_all" ON evidence_items;
CREATE POLICY "evidence_items_select_staff_all" ON evidence_items FOR SELECT
  USING (is_staff());

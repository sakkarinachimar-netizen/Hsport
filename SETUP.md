# PDSHS e-Portfolio — ทำให้ใช้งานจริงบนเว็บ

ระบบนี้เป็นเว็บ static (React + Babel ในเบราว์เซอร์) + backend Supabase แยกของ portfolio เอง
(project `kmkbzdpwcsqwghkxxpst` — ไม่เกี่ยวกับ HSresearch)

## ขั้นตอนที่ต้องทำเอง (ผมทำแทนไม่ได้)

### 1. สร้างตาราง + ระบบบทบาทในฐานข้อมูล
Supabase Dashboard → project `kmkbzdpwcsqwghkxxpst` → **SQL Editor**
⚠️ ห้ามรันบน Supabase ของ HSresearch

- **ติดตั้งใหม่ (ยังไม่เคยรัน):** วางเนื้อหา `schema.sql` ทั้งหมด → **Run**
  (ได้ตาราง + RLS + seed ฝึกงาน + **trigger สร้างโปรไฟล์/บทบาทอัตโนมัติ**)
- **เคยรัน schema.sql แล้ว (มีข้อมูล/ผู้ใช้อยู่):** อย่ารัน schema.sql ซ้ำ (มันลบข้อมูล)
  ให้รัน `db-roles.sql` แทน — เพิ่ม trigger + เติมโปรไฟล์ให้ user เดิม โดยไม่ลบอะไร

**บทบาท (users.role):** `student` = นักเรียน · `teacher` = อาจารย์ที่ปรึกษา/ผู้ประเมิน · `admin` = ผู้ดูแลระบบ

### 2. สร้างผู้ใช้ + กำหนดบทบาท
มี trigger แล้ว → แค่สร้าง user ใน Auth ระบบจะสร้างโปรไฟล์ให้อัตโนมัติ (role เริ่มต้น = student)

1. **Authentication → Users → Add user** → email + password (ติ๊ก **Auto Confirm**)
2. กำหนดบทบาทใน **SQL Editor** (แก้อีเมลให้ตรง):
```sql
-- ผู้ดูแลระบบ
UPDATE users SET role='admin',   name='ชื่อผู้ดูแล'        WHERE email='admin@pdshs.ac.th';
-- อาจารย์ที่ปรึกษา/ผู้ประเมิน
UPDATE users SET role='teacher', name='อ. ชื่อ-สกุล'       WHERE email='teacher@pdshs.ac.th';
-- นักเรียน
UPDATE users SET role='student', name='ชื่อ-สกุล',
  student_code='65001234', grade='ม.6'                     WHERE email='student@pdshs.ac.th';
```
(ดูตัวช่วย/คำสั่งตรวจรายชื่อทั้งหมดได้ใน `db-roles.sql`)

### 3. ทดสอบ login จริง
`cd ~/HSeportfolio && python3 -m http.server 8000` → เปิด http://localhost:8000
→ กรอกอีเมล+รหัสที่สร้าง → ระบบเข้า dashboard ตาม role ใน DB
(ถ้าเปิดแบบไม่มีเน็ต/ไม่มี Supabase จะกลับเป็นโหมดสาธิตอัตโนมัติ)

### 4. ขึ้นเว็บจริง (เลือกทางใดทางหนึ่ง)
**Netlify (ง่ายสุด):** ลากโฟลเดอร์ `HSeportfolio` ใส่ที่ app.netlify.com/drop
หรือ `npx netlify-cli deploy --prod --dir .` (มี `netlify.toml` ให้แล้ว)
**ตั้งค่าใน Supabase หลัง deploy:** Authentication → URL Configuration →
ใส่ domain ที่ได้ลงใน Site URL / Redirect URLs

## สถานะการเชื่อมข้อมูลจริง (mock → DB)
- [x] Auth จริง (login/logout/คง session)
- [ ] หน้านักเรียน: แฟ้มสะสมผลงาน + อัปโหลดหลักฐาน
- [ ] หน้าอาจารย์: รายการตรวจ + บันทึกผลประเมิน
- [ ] หน้าแอดมิน: จัดการผู้ใช้
- [ ] หน้าฝึกงาน: สถานที่/ช่วงเวลา/คำขอ

ส่วนที่ยังไม่ติ๊กจะยังแสดงข้อมูลตัวอย่าง (mock) จนกว่าจะ wire เสร็จทีละหน้า

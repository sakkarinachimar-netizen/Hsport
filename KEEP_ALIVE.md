# Keep-alive — ป้องกัน Supabase ถูก auto-pause

Supabase free tier จะ **pause โปรเจกต์อัตโนมัติเมื่อไม่มี activity ~7 วัน**
ทำให้เว็บล่ม (DNS หาย) ผู้ใช้กดเข้าไม่ได้จนกว่าแอดมินจะ resume

ในโฟลเดอร์นี้มี GitHub Actions workflow ที่ยิง query เล็ก ๆ ไปที่ Supabase ทุก 2 วัน
→ นับเป็น activity → ไม่โดน pause → ✅ uptime 24/7

ไฟล์: [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml) (เขียนพร้อมแล้ว)

## วิธี Activate (ทำครั้งเดียว ~5 นาที)

ต้องเอาโปรเจกต์ขึ้น GitHub ก่อน (ถ้ายังไม่มี repo)

### 1) สร้าง repo ว่าง ๆ ใน GitHub
- ไปที่ https://github.com/new
- Owner: บัญชีคุณ
- Name: `pdshs-eportfolio` (หรือชื่ออะไรก็ได้)
- Private/Public ก็ได้ (anon key เป็น public อยู่แล้ว — RLS คุม)
- **ไม่ต้อง**ติ๊ก README/.gitignore/license
- กด **Create repository** → copy URL ที่ขึ้น (เช่น `https://github.com/<user>/pdshs-eportfolio.git`)

### 2) Push โค้ดขึ้น (รันใน Terminal)
```bash
cd ~/HSeportfolio
git init
git add -A
git commit -m "Initial commit: PDSHS e-Portfolio"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```

### 3) เปิดใช้ GitHub Actions
- เปิด repo บน GitHub → tab **Actions** → ถ้ามี prompt "I understand my workflows, go ahead and enable them" → กดยืนยัน
- ในรายการจะเห็น workflow **"Supabase keep-alive"** → คลิกชื่อ → ปุ่ม **Run workflow** (ทดสอบรันมือดูก่อนว่าผ่าน)
- จากนี้ workflow จะรันเองทุก 2 วัน (03:00 UTC = 10:00 ICT)

### 4) ตรวจว่าใช้งานได้
หลังรันแล้วจะเห็น log ประมาณ:
```
Pinging Supabase project (kmkbzdpwcsqwghkxxpst)...
REST  → HTTP 200
Auth  → OK
✓ keep-alive done
```
ถ้าเห็นแบบนี้ = ✅ ใช้งานได้ Supabase จะไม่ถูก pause อีก

## ปรับความถี่
แก้ `cron` ในไฟล์ workflow:
- `'0 3 */2 * *'` — ทุก 2 วัน (ค่าเริ่มต้น) — ปลอดภัยมาก
- `'0 3 */3 * *'` — ทุก 3 วัน — ประหยัด minutes
- `'0 3 * * *'` — ทุกวัน — ปลอดภัยสุด แต่ใช้ minutes มากกว่า (ยังต่ำกว่าโควตาฟรีเยอะ)

GitHub Actions ฟรี: public repo = ไม่จำกัด, private repo = 2000 นาที/เดือน (workflow นี้ใช้ ~10 วินาที/ครั้ง = ~5 นาที/เดือน เท่านั้น)

## ทางเลือกอื่น (ถ้าไม่อยากใช้ GitHub)

**UptimeRobot** (ฟรี) — สมัครที่ https://uptimerobot.com →
- New Monitor → HTTP(s)
- URL: `https://kmkbzdpwcsqwghkxxpst.supabase.co/rest/v1/internship_sites?select=id&limit=1`
- Custom HTTP Header: `apikey: <anon-key-from-supabase-config.jsx>`
- Interval: 5 minutes (default ฟรี)

UptimeRobot จะ ping ทุก 5 นาที → ป้องกัน pause + แจ้งเมลถ้าเว็บล่ม

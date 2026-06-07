// PDSHS e-Portfolio — Supabase Edge Function: delete-user
// ลบผู้ใช้แบบสมบูรณ์ (auth.users + public.users)
// ตรวจสิทธิ์: ต้องล็อกอินด้วยบัญชี role='admin' เท่านั้น
//
// Deploy:  supabase functions deploy delete-user --no-verify-jwt
//          (หรือใช้ Dashboard → Edge Functions → New function → paste โค้ดนี้)
//
// Env (Supabase inject ให้อัตโนมัติ — ไม่ต้องตั้งเอง):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const { user_id } = await req.json().catch(() => ({}));
    if (!user_id) {
      return json({ error: "user_id required" }, 400);
    }

    // 1) ตรวจว่า caller เป็น admin จริงไหม (ใช้ token ของผู้เรียก + RLS)
    const authHeader = req.headers.get("Authorization") || "";
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ error: "not authenticated" }, 401);

    const { data: callerProfile } = await callerClient
      .from("users").select("role").eq("id", caller.id).single();
    if (!callerProfile || callerProfile.role !== "admin") {
      return json({ error: "admin only" }, 403);
    }

    // ป้องกัน admin ลบบัญชีตัวเอง (กันล็อกตัวเองออก)
    if (caller.id === user_id) {
      return json({ error: "cannot delete your own account" }, 400);
    }

    // 2) ใช้ service_role ทำงานข้าม RLS ลบทั้ง 2 ฝั่ง
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ลบจาก public.users ก่อน (CASCADE จะลบ evidence/eval/applications ที่ผูกอยู่)
    const { error: dbErr } = await admin.from("users").delete().eq("id", user_id);
    if (dbErr) return json({ error: "db delete failed: " + dbErr.message }, 500);

    // ลบจาก auth.users (ปลด email + password)
    const { error: authErr } = await admin.auth.admin.deleteUser(user_id);
    if (authErr) return json({ error: "auth delete failed: " + authErr.message }, 500);

    return json({ ok: true, deleted: user_id }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

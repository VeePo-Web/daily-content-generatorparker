import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TARGET_EMAIL = '1.lineofjudah.1@gmail.com';
const TARGET_PASSWORD = 'jesusislord#1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Try to create the user
    let userId: string | undefined;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: TARGET_PASSWORD,
      email_confirm: true,
    });

    if (created?.user) {
      userId = created.user.id;
    } else if (createErr) {
      // User likely exists — find them
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listErr) throw listErr;
      const existing = list.users.find((u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase());
      if (!existing) throw createErr;
      userId = existing.id;

      // Reset password just to be safe
      await supabase.auth.admin.updateUserById(userId, {
        password: TARGET_PASSWORD,
        email_confirm: true,
      });
    }

    if (!userId) throw new Error('No user id resolved');

    // Ensure profile row
    await supabase.from('profiles').upsert(
      { id: userId, email: TARGET_EMAIL },
      { onConflict: 'id' }
    );

    // Ensure admin role
    const { error: roleErr } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({ success: true, user_id: userId, email: TARGET_EMAIL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

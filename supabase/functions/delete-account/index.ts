// Edge Function `delete-account` — löscht den eigenen Auth-User (AP8).
// `unlocks` werden über den FK `on delete cascade` mitgelöscht (Projektplan §7, §10).
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const anonClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const {
    data: { user },
    error: userError,
  } = await anonClient.auth.getUser();
  if (userError || !user) {
    return Response.json({ ok: false, code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('delete-account: failed', deleteError);
    return Response.json({ ok: false, code: 'INTERNAL' }, { status: 500 });
  }

  return Response.json({ ok: true, code: 'DELETED' });
});

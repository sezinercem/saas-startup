/**
 * NexaFlow — Supabase Client
 * Anon key only — safe for browser use.
 * NEVER put the service_role key here.
 */
(function () {
  const SUPABASE_URL     = 'https://moabhslreqhhzpaoboix.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vYWJoc2xyZXFoaHpwYW9ib2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzExMjQsImV4cCI6MjA4ODIwNzEyNH0._UYAydyS3UhdonCXni7qYMmBxDt5PAJsD_h7EATpqRM';

  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

  // Convenience: get current user synchronously from session cache
  window.getUser = async function () {
    const { data: { user } } = await window.sb.auth.getUser();
    return user;
  };

  // Convenience: get current session
  window.getSession = async function () {
    const { data: { session } } = await window.sb.auth.getSession();
    return session;
  };
})();

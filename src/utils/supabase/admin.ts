import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Chave de serviço (privada)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

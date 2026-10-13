import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  const user = useState<User | null>('auth-user', () => null)
  const authLoading = useState<boolean>('auth-loading', () => true)

  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user ?? null
    authLoading.value = false
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
    authLoading.value = false
  })

  return {
    provide: {
      supabase,
    },
  }
})
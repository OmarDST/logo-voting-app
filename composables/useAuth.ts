import type { User } from '@supabase/supabase-js'

const ALLOWED_DOMAIN = '@dst.com.bn'

export const useAuth = () => {
  const { $supabase } = useNuxtApp()

  const user = useState<User | null>('auth-user', () => null)
  const authLoading = useState<boolean>('auth-loading', () => true)
  const authError = useState<string | null>('auth-error', () => null)

  const signIn = async () => {
    authError.value = null
    try {
      const baseURL = useRuntimeConfig().app.baseURL || '/'
      const redirectTo = new URL(
        'auth/callback',
        `${window.location.origin}${baseURL.endsWith('/') ? baseURL : `${baseURL}/`}`,
      ).href

      console.log('Sign in redirectTo:', redirectTo)
      
      const { error } = await $supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            hd: 'dst.com.bn',
          },
          redirectTo,
        },
      })
      if (error) {
        authError.value = error.message
        return false
      }
      return true
    } catch (err: any) {
      authError.value = err.message ?? 'Sign-in failed. Please try again.'
      return false
    }
  }

  const signOut = async () => {
    await $supabase.auth.signOut()
    user.value = null
  }

  const isAuthenticated = computed(() => !!user.value)

  const isDSTUser = computed(() => {
    return user.value?.email?.endsWith(ALLOWED_DOMAIN) ?? false
  })

  const displayName = computed(() => {
    if (!user.value) return 'User'
    return user.value.user_metadata?.full_name 
      ?? user.value.user_metadata?.name 
      ?? user.value.email?.split('@')[0] 
      ?? 'User'
  })

  const avatarUrl = computed(() => {
    if (!user.value) return null
    return user.value.user_metadata?.avatar_url 
      ?? user.value.user_metadata?.picture 
      ?? null
  })

  return {
    user: readonly(user),
    authLoading: readonly(authLoading),
    authError,
    isAuthenticated,
    isDSTUser,
    signIn,
    signOut,
    displayName,
    avatarUrl,
  }
}
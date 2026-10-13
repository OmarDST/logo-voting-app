<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <Transition name="slide-up">
          <div v-if="show" class="modal-panel auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <!-- DST Logo icon -->
            <div class="auth-logo">
              <div class="auth-logo-ring">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="14" fill="url(#authGrad)" />
                  <path d="M13 24l8 8 14-14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <defs>
                    <linearGradient id="authGrad" x1="0" y1="0" x2="48" y2="48">
                      <stop offset="0%" stop-color="#7C3AED"/>
                      <stop offset="100%" stop-color="#4C1D95"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <h2 id="auth-modal-title" class="auth-title">Sign in to DST Logo Vote</h2>
            <p class="auth-subtitle">
              Use your <strong>@dst.com.bn</strong> Google account to upload logos and cast votes.
            </p>

            <!-- Error -->
            <Transition name="fade">
              <div v-if="authError" class="error-msg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ authError }}
              </div>
            </Transition>

            <!-- Google Sign In Button -->
            <button
              id="google-sign-in-btn"
              class="google-btn"
              :disabled="signingIn"
              @click="handleSignIn"
            >
              <template v-if="signingIn">
                <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Signing in…
              </template>
              <template v-else>
                <!-- Google G Logo -->
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </template>
            </button>

            <p class="auth-note">
              🔒 Only <strong>@dst.com.bn</strong> accounts are permitted.
            </p>

            <button class="modal-close-text" @click="close">
              Maybe later
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const { signIn, authError } = useAuth()
const signingIn = ref(false)

const handleSignIn = async () => {
  signingIn.value = true
  try {
    const ok = await signIn()
    if (ok) {
      emit('success')
      emit('close')
    }
  } finally {
    signingIn.value = false
  }
}

const close = () => {
  authError.value = null
  emit('close')
}
</script>

<style scoped>
.auth-panel {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.auth-logo {
  margin-bottom: 0.5rem;
}

.auth-logo-ring {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  box-shadow: 0 8px 30px var(--color-primary-glow);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.auth-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  max-width: 300px;
  line-height: 1.5;
}

.error-msg {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #DC2626;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  text-align: left;
  width: 100%;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-strong);
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.google-btn:not(:disabled):hover {
  background: var(--color-bg);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-note {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.modal-close-text {
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
  font-family: var(--font-sans);
}

.modal-close-text:hover {
  color: var(--color-text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

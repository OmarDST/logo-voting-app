<template>
  <header class="app-header">
    <div class="container header-inner">
      <!-- Logo / Branding -->
      <div class="header-brand">
        <div class="brand-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#brandGrad)" />
            <path d="M7 14l5 5 9-9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stop-color="#7C3AED"/>
                <stop offset="100%" stop-color="#4C1D95"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h1 class="brand-title">DST Platform Logo Vote</h1>
          <p class="brand-sub">Choose your favourite design</p>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="header-actions">
        <template v-if="!authLoading">
          <!-- Authenticated User -->
          <template v-if="isAuthenticated && isDSTUser">
            <button
              id="upload-logo-btn"
              class="btn btn-accent btn-sm"
              :disabled="isExpired"
              @click="$emit('upload')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Logo
            </button>
            <div class="user-chip">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="displayName"
                class="user-avatar"
              />
              <div v-else class="user-avatar-fallback">
                {{ userInitial }}
              </div>
              <span class="user-name">{{ userFirstName }}</span>
              <button
                id="sign-out-btn"
                class="btn-icon"
                title="Sign out"
                @click="handleSignOut"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </template>

          <!-- Not authenticated -->
          <template v-else>
            <button
              id="sign-in-btn"
              class="btn btn-primary btn-sm"
              @click="$emit('sign-in')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </button>
          </template>
        </template>

        <!-- Loading skeleton -->
        <template v-else>
          <div class="skeleton" style="width: 90px; height: 32px; border-radius: 9999px;" />
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  upload: []
  'sign-in': []
}>()

const { user, isAuthenticated, isDSTUser, authLoading, signOut, displayName, avatarUrl } = useAuth()
const { isExpired } = useCountdown()

const userInitial = computed(() => displayName.value?.[0]?.toUpperCase() ?? '?')
const userFirstName = computed(() => displayName.value?.split(' ')[0] ?? 'User')

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(237, 233, 254, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 20px rgba(91, 33, 182, 0.08);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 1rem;
  min-width: 0;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-shrink: 0;
  min-width: 0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  line-height: 1.2;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  min-width: 0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  backdrop-filter: blur(8px);
  min-width: 0;
  max-width: 200px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar-fallback {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark));
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .header-inner {
    gap: 0.5rem;
  }

  .header-brand {
    gap: 0.5rem;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .brand-title {
    font-size: 1rem;
  }

  .brand-sub {
    display: none;
  }

  .header-actions {
    gap: 0.5rem;
  }

  .user-chip {
    max-width: 140px;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    gap: 0.375rem;
  }

  .user-avatar,
  .user-avatar-fallback {
    width: 24px;
    height: 24px;
  }

  .user-avatar-fallback {
    font-size: 0.6875rem;
  }

  .user-name {
    max-width: 80px;
    font-size: 0.8125rem;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .btn-sm svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 360px) {
  .user-chip {
    max-width: 100px;
  }

  .user-name {
    max-width: 50px;
  }
}
</style>

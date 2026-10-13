<template>
  <div class="callback-container">
    <div class="callback-card">
      <div class="spinner" />
      <p>Completing sign in…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $supabase } = useNuxtApp()

// OAuth implicit flow returns tokens in the URL hash; wait for the client to consume them.
if (import.meta.client && window.location.hash.includes('access_token')) {
  await new Promise<void>((resolve) => {
    const { data: { subscription } } = $supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe()
        resolve()
      }
    })
    void $supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        subscription.unsubscribe()
        resolve()
      }
    })
  })
} else {
  await $supabase.auth.getSession()
}

await navigateTo('/')
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.callback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
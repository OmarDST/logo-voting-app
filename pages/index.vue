<template>
  <div class="page-wrapper">
    <!-- Countdown Banner -->
    <CountdownBanner />

    <!-- Header -->
    <AppHeader
      @upload="openUpload"
      @sign-in="showAuthModal = true"
    />

    <!-- Main Content -->
    <main id="main-content">
      <LogoGrid />
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container footer-inner">
        <p class="footer-text">DST Logo Voting &copy; {{ currentYear }} · Built with 💜 by the DST Team</p>
      </div>
    </footer>

    <!-- Modals -->
    <UploadModal
      :show="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="handleUploaded"
    />
    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />

    <!-- Toast Notification -->
    <Transition name="slide-up">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'DST Logo Voting — Choose Your Favourite Design',
})

const { isAuthenticated, isDSTUser } = useAuth()
const { subscribeLogos } = useLogos()
const { isExpired } = useCountdown()

const showUploadModal = ref(false)
const showAuthModal = ref(false)

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const currentYear = new Date().getFullYear()

// Subscribe to Firestore real-time updates
let unsubscribe: (() => void) | null = null
onMounted(() => {
  unsubscribe = subscribeLogos()
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const openUpload = () => {
  if (!isAuthenticated.value || !isDSTUser.value) {
    showAuthModal.value = true
    return
  }
  if (isExpired.value) {
    showToast('Voting has closed. No more uploads allowed.', 'error')
    return
  }
  showUploadModal.value = true
}

const handleUploaded = () => {
  showToast('🎉 Logo uploaded successfully!', 'success')
}

const handleAuthSuccess = () => {
  showToast('✅ Welcome! You can now vote and upload logos.', 'success')
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 4000)
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  padding: 1.5rem 0;
  background: rgba(237, 233, 254, 0.5);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}
</style>

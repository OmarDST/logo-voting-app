<template>
  <article
    class="logo-card glass-card"
    :class="{ voted: hasVotedForThis, expired: isExpired }"
  >
    <!-- Logo Image -->
    <div class="card-image-wrap">
      <img
        :src="logo.imageUrl"
        :alt="logo.title"
        class="card-image"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="card-image-overlay" />

      <!-- Vote Count Badge -->
      <div class="vote-badge" :class="{ active: logo.votes.length > 0 }">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>
        {{ logo.votes.length }}
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <!-- Logo Title -->
      <h3 class="card-title">{{ logo.title }}</h3>

      <!-- Uploader info -->
      <div class="uploader-row">
        <img
          v-if="logo.uploaderAvatar"
          :src="logo.uploaderAvatar"
          :alt="logo.uploaderName"
          class="uploader-avatar"
        />
        <div v-else class="uploader-avatar-fallback">
          {{ uploaderInitial }}
        </div>
        <div class="uploader-info">
          <span class="uploader-name">{{ logo.uploaderName }}</span>
          <span class="upload-date">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Vote Button -->
      <button
        :id="`vote-btn-${logo.id}`"
        class="vote-btn"
        :class="{ voted: hasVotedForThis }"
        :disabled="!isAuthenticated || !isDSTUser || isExpired || voting"
        @click="handleVote"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          :fill="hasVotedForThis ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>
        <span>{{ hasVotedForThis ? 'Voted!' : 'Vote' }}</span>
        <span class="vote-count">{{ logo.votes.length }}</span>
      </button>

      <!-- Not authenticated hint -->
      <p v-if="!isAuthenticated" class="vote-hint">
        Sign in to vote
      </p>
      <p v-else-if="isExpired" class="vote-hint expired">
        Voting closed
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Logo } from '~/composables/useLogos'

const props = defineProps<{
  logo: Logo
}>()

const { isAuthenticated, isDSTUser } = useAuth()
const { toggleVote, hasVoted } = useLogos()
const { isExpired } = useCountdown()

const voting = ref(false)

const hasVotedForThis = computed(() => hasVoted(props.logo))

const uploaderInitial = computed(() => props.logo.uploaderName?.[0]?.toUpperCase() ?? '?')

const formattedDate = computed(() => {
  if (!props.logo.createdAt) return ''
  return props.logo.createdAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})

const handleVote = async () => {
  if (voting.value) return
  voting.value = true
  try {
    await toggleVote(props.logo.id)
  } finally {
    voting.value = false
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23EDE9FE" width="400" height="300"/%3E%3Ctext fill="%237C3AED" font-family="Inter,sans-serif" font-size="16" text-anchor="middle" x="200" y="155"%3EImage not available%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped>
.logo-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all var(--transition-base);
  cursor: default;
}

.logo-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-strong);
}

.logo-card.voted {
  border-color: rgba(132, 204, 22, 0.4);
  box-shadow: 0 4px 20px rgba(132, 204, 22, 0.15), var(--shadow-md);
}

/* Image */
.card-image-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-bg-alt);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
  transition: transform var(--transition-slow);
}

.logo-card:hover .card-image {
  transform: scale(1.04);
}

.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(91, 33, 182, 0.08), transparent 50%);
  pointer-events: none;
}

/* Vote Badge */
.vote-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(30, 27, 75, 0.7);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.vote-badge.active {
  background: rgba(132, 204, 22, 0.85);
  color: var(--color-text-on-accent);
}

/* Card Body */
.card-body {
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

/* Uploader */
.uploader-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.uploader-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
}

.uploader-avatar-fallback {
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

.uploader-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.uploader-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-date {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
}

/* Vote Button */
.vote-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid var(--color-border-strong);
  background: transparent;
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
  width: 100%;
}

.vote-btn:not(:disabled):hover {
  border-color: var(--color-accent);
  color: var(--color-accent-dark);
  background: rgba(132, 204, 22, 0.08);
  transform: translateY(-1px);
}

.vote-btn.voted {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-dark));
  border-color: transparent;
  color: var(--color-text-on-accent);
  box-shadow: 0 4px 12px rgba(132, 204, 22, 0.35);
}

.vote-btn.voted:not(:disabled):hover {
  background: linear-gradient(135deg, var(--color-accent-dark), #4D7C0F);
  color: white;
}

.vote-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.vote-count {
  background: rgba(0,0,0,0.12);
  border-radius: var(--radius-full);
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.vote-btn.voted .vote-count {
  background: rgba(0,0,0,0.15);
}

.vote-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: center;
  margin-top: -0.25rem;
}

.vote-hint.expired {
  color: #EF4444;
  font-weight: 500;
}
</style>

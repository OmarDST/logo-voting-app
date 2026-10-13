<template>
  <article
    class="logo-card glass-card"
    :class="{ voted: hasVotedForThis, expired: isExpired }"
  >
    <!-- Logo Image -->
    <div class="card-image-wrap" @click="openZoom">
      <img
        :src="logo.imageUrl"
        :alt="logo.title"
        class="card-image"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="card-image-overlay" />
      <div class="zoom-hint" v-if="!isExpired">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 23l-5.5-5.5"/>
          <circle cx="11" cy="11" r="8"/>
        </svg>
      </div>

      <!-- Vote Count Badge -->
      <div class="vote-badge" :class="{ active: logo.votes.length > 0, top: isTopVoted }">
        <svg v-if="isTopVoted" class="crown-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>
        {{ logo.votes.length }}
      </div>

      <!-- Owner Actions -->
      <div v-if="isOwner" class="card-actions">
        <button
          class="action-btn edit-btn"
          @click.stop="openEdit"
          title="Edit title"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          class="action-btn delete-btn"
          @click.stop="confirmDelete"
          title="Delete logo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Zoom Modal -->
    <Teleport to="body">
      <Transition name="zoom">
        <div v-if="showZoom" class="zoom-overlay" @click.self="closeZoom" @keydown.esc="closeZoom">
          <div class="zoom-content" @click.stop>
            <button class="zoom-close" @click="closeZoom" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img :src="logo.imageUrl" :alt="logo.title" class="zoom-image" />
            <div class="zoom-info">
              <h3>{{ logo.title }}</h3>
              <p>by {{ logo.uploaderName }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Card Body -->
    <div class="card-body">
      <!-- Logo Title (editable) -->
      <div class="title-row">
        <h3 class="card-title" v-if="!editing">{{ logo.title }}</h3>
        <div v-else class="edit-title">
          <input
            v-model="editTitle"
            @keyup.enter="saveEdit"
            @blur="saveEdit"
            class="edit-input"
            ref="editInput"
            maxlength="80"
          />
        </div>
      </div>

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

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
          <Transition name="slide-up">
            <div class="modal-panel delete-panel" role="dialog" aria-modal="true">
              <div class="modal-header">
                <h3 class="modal-title">Delete Logo</h3>
              </div>
              <p class="delete-msg">Are you sure you want to delete "<strong>{{ logo.title }}</strong>"? This cannot be undone.</p>
              <div class="modal-actions">
                <button class="btn btn-ghost" @click="showDeleteConfirm = false">Cancel</button>
                <button class="btn btn-danger" @click="handleDelete" :disabled="deleting">
                  <span v-if="deleting">Deleting…</span>
                  <span v-else>Delete</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import type { Logo } from '~/composables/useLogos'
import { ref, computed, nextTick } from 'vue'

const props = defineProps<{
  logo: Logo
}>()

const { isAuthenticated, isDSTUser, user } = useAuth()
const { toggleVote, hasVoted, updateLogo, deleteLogo, sortedLogos } = useLogos()
const { isExpired } = useCountdown()

const voting = ref(false)
const editing = ref(false)
const editTitle = ref('')
const editInput = ref<HTMLInputElement | null>(null)
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const showZoom = ref(false)

const hasVotedForThis = computed(() => hasVoted(props.logo))

const isOwner = computed(() => {
  return user.value?.id === props.logo.uploaderUid
})

const maxVotes = computed(() => {
  if (!sortedLogos.value.length) return 0
  return Math.max(...sortedLogos.value.map(l => l.votes.length))
})

const isTopVoted = computed(() => {
  return props.logo.votes.length > 0 && props.logo.votes.length === maxVotes.value
})

const uploaderInitial = computed(() => props.logo.uploaderName?.[0]?.toUpperCase() ?? '?')

const formattedDate = computed(() => {
  if (!props.logo.createdAt) return ''
  const date = new Date(props.logo.createdAt)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})

const openEdit = () => {
  if (!isOwner.value) return
  editTitle.value = props.logo.title
  editing.value = true
  nextTick(() => editInput.value?.focus())
}

const saveEdit = async () => {
  if (!editing.value) return
  const title = editTitle.value.trim()
  if (!title) return
  const ok = await updateLogo(props.logo.id, title)
  if (ok) {
    editing.value = false
  }
}

const confirmDelete = () => {
  if (!isOwner.value) return
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  deleting.value = true
  const ok = await deleteLogo(props.logo.id)
  if (ok) {
    showDeleteConfirm.value = false
  }
  deleting.value = false
}

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

const openZoom = () => {
  showZoom.value = true
  document.body.style.overflow = 'hidden'
}

const closeZoom = () => {
  showZoom.value = false
  document.body.style.overflow = ''
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

  .vote-badge.top {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #1a1a2e;
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }

  .vote-badge.top .crown-icon {
    animation: crown-pulse 2s ease-in-out infinite;
  }

  @keyframes crown-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  /* Owner Actions */
  .card-actions {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    display: flex;
    gap: 0.375rem;
    opacity: 0;
    transform: translateX(-8px);
    transition: all var(--transition-base);
  }

  .logo-card:hover .card-actions {
    opacity: 1;
    transform: translateX(0);
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-surface-glass);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    transition: all var(--transition-fast);
  }

  .action-btn:hover {
    background: var(--color-bg);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .delete-btn:hover {
    background: rgba(220, 38, 38, 0.1);
    border-color: #DC2626;
    color: #DC2626;
  }

  /* Title Row */
  .title-row {
    position: relative;
  }

  .edit-title {
    width: 100%;
  }

  .edit-input {
    width: 100%;
    padding: 0.375rem 0.625rem;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--color-primary-light);
    background: var(--color-bg);
    font-size: 1rem;
    font-weight: 700;
    font-family: var(--font-sans);
    color: var(--color-text-primary);
    outline: none;
  }

  .edit-input:focus {
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: text-overflow 0.3s ease;
  }

  .logo-card:hover .card-title {
    text-overflow: clip;
    animation: marquee 8s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(calc(-100% + 100vw - 2.5rem));
    }
    100% {
      transform: translateX(0);
    }
  }

  @media (max-width: 480px) {
    .logo-card:hover .card-title {
      animation: marquee-mobile 6s linear infinite;
    }
  }

  @keyframes marquee-mobile {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(calc(-100% + 100vw - 1.5rem));
    }
    100% {
      transform: translateX(0);
    }
  }

  /* Delete Modal */
  .delete-panel {
    max-width: 380px;
  }

  .delete-msg {
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }

  .btn-danger {
    background: linear-gradient(135deg, #DC2626, #B91C1C);
    border: none;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: linear-gradient(135deg, #B91C1C, #991B1B);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
  }

  .btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Vote Button */
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

  /* Zoom Hint */
  .zoom-hint {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: rgba(30, 27, 75, 0.7);
    backdrop-filter: blur(8px);
    color: white;
    opacity: 0;
    transform: translateY(8px);
    transition: all var(--transition-base);
  }

  .logo-card:hover .zoom-hint {
    opacity: 1;
    transform: translateY(0);
  }

  /* Zoom Modal */
  .zoom-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
  }

  .zoom-overlay-enter-active,
  .zoom-overlay-leave-active {
    transition: opacity 0.25s ease;
  }

  .zoom-overlay-enter-from,
  .zoom-overlay-leave-to {
    opacity: 0;
  }

  .zoom-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .zoom-content-enter-active,
  .zoom-content-leave-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  .zoom-content-enter-from,
  .zoom-content-leave-to {
    transform: scale(0.95);
    opacity: 0;
  }

  .zoom-image {
    max-width: 100%;
    max-height: 75vh;
    object-fit: contain;
    border-radius: var(--radius-md);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .zoom-info {
    text-align: center;
    color: white;
  }

  .zoom-info h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .zoom-info p {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .zoom-close {
    position: absolute;
    top: -3.5rem;
    right: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .zoom-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
</style>

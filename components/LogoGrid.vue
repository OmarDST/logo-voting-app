<template>
  <section class="logo-grid-section">
    <!-- Sort Controls -->
    <div class="grid-toolbar container">
      <div class="grid-meta">
        <h2 class="grid-heading">
          <span class="heading-count">{{ sortedLogos.length }}</span>
          {{ sortedLogos.length === 1 ? 'Logo' : 'Logos' }} Submitted
        </h2>
      </div>
      <div class="sort-controls">
        <span class="sort-label">Sort by:</span>
        <div class="sort-tabs" role="group" aria-label="Sort options">
          <button
            id="sort-votes-btn"
            class="sort-tab"
            :class="{ active: sortMode === 'votes' }"
            @click="sortMode = 'votes'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            Top Votes
          </button>
          <button
            id="sort-recent-btn"
            class="sort-tab"
            :class="{ active: sortMode === 'recent' }"
            @click="sortMode = 'recent'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Recent
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="logosLoading" class="container">
      <div class="logo-grid">
        <div v-for="i in 6" :key="i" class="glass-card skeleton-card">
          <div class="skeleton" style="aspect-ratio:4/3; border-radius: var(--radius-md) var(--radius-md) 0 0;" />
          <div style="padding: 1rem; display:flex; flex-direction:column; gap:0.5rem;">
            <div class="skeleton" style="height:18px; width:70%;" />
            <div class="skeleton" style="height:14px; width:50%;" />
            <div class="skeleton" style="height:38px; border-radius:9999px; margin-top:0.25rem;" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sortedLogos.length === 0" class="empty-state container">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <h3 class="empty-title">No logos yet</h3>
      <p class="empty-subtitle">Be the first to upload a logo proposal for the team!</p>
    </div>

    <!-- Logo Grid -->
    <div v-else class="container">
      <TransitionGroup name="logo-grid" tag="div" class="logo-grid">
        <LogoCard
          v-for="logo in sortedLogos"
          :key="logo.id"
          :logo="logo"
        />
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
const { sortedLogos, logosLoading, sortMode } = useLogos()
</script>

<style scoped>
.logo-grid-section {
  padding: 2rem 0 4rem;
}

.grid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.grid-heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.heading-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark));
  color: white;
  font-size: 0.875rem;
  font-weight: 800;
  min-width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  padding: 0 0.5rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.sort-tabs {
  display: flex;
  background: var(--color-surface-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 0.25rem;
  gap: 0.125rem;
  backdrop-filter: blur(8px);
}

.sort-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.sort-tab:hover:not(.active) {
  color: var(--color-text-secondary);
  background: var(--color-bg-alt);
}

.sort-tab.active {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark));
  color: white;
  box-shadow: 0 2px 8px var(--color-primary-glow);
}

/* Logo Grid */
.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Skeleton Card */
.skeleton-card {
  overflow: hidden;
  background: var(--color-surface-glass);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rem 1rem;
  text-align: center;
}

.empty-icon {
  color: var(--color-primary-light);
  opacity: 0.4;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  font-size: 1rem;
  color: var(--color-text-muted);
  max-width: 360px;
}

/* Grid Transition */
.logo-grid-enter-active {
  transition: all 0.4s ease;
}
.logo-grid-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}
.logo-grid-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
.logo-grid-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.logo-grid-move {
  transition: transform 0.4s ease;
}
</style>

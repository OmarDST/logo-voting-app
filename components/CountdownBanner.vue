<template>
  <div class="countdown-banner" :class="{ expired: isExpired }">
    <div class="container countdown-inner">
      <!-- Label -->
      <div class="countdown-label">
        <div class="pulse-dot" v-if="!isExpired" />
        <span>{{ isExpired ? '🏁 Voting Has Closed!' : label }}</span>
      </div>

      <!-- Timer Blocks -->
      <div class="countdown-timer" v-if="!isExpired">
        <div class="time-block" v-for="unit in timeUnits" :key="unit.label">
          <div class="time-value">{{ pad(unit.value) }}</div>
          <div class="time-label">{{ unit.label }}</div>
        </div>
      </div>

      <!-- Expired Message -->
      <div class="expired-msg" v-else>
        Thank you for participating! Results are being tallied.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { days, hours, minutes, seconds, isExpired, pad, label } = useCountdown()

const timeUnits = computed(() => [
  { value: days.value, label: 'Days' },
  { value: hours.value, label: 'Hours' },
  { value: minutes.value, label: 'Mins' },
  { value: seconds.value, label: 'Secs' },
])
</script>

<style scoped>
.countdown-banner {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-light) 100%);
  color: white;
  padding: 0.875rem 0;
  position: relative;
  overflow: hidden;
}

.countdown-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.countdown-banner.expired {
  background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
}

.countdown-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  position: relative;
  flex-wrap: wrap;
}

.countdown-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.75); }
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  padding: 0.375rem 0.75rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all var(--transition-base);
}

.time-block:hover {
  background: rgba(255, 255, 255, 0.18);
}

.time-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-accent-light);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
  margin-top: 0.125rem;
}

.countdown-timer .time-block + .time-block::before {
  display: none;
}

.expired-msg {
  font-size: 0.9375rem;
  opacity: 0.85;
  font-style: italic;
}

@media (max-width: 640px) {
  .countdown-inner {
    justify-content: center;
    text-align: center;
  }

  .countdown-label {
    width: 100%;
    justify-content: center;
  }

  .time-block {
    min-width: 52px;
    padding: 0.25rem 0.5rem;
  }

  .time-value {
    font-size: 1.4rem;
  }
}
</style>

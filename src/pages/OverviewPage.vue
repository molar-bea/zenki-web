<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps([
  'announcements', 
  'appointmentSlots'
])

const emit = defineEmits<{
  (e: 'go-announcements'): void
}>()

// 1. Calculate today's date formatted to match the slot.date from the database/service
const today = new Date()
const todayFormatted = computed(() => {
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

// 2. Format variables for the prominent UI date display
const displayDay = computed(() => today.toLocaleDateString('en-US', { weekday: 'long' }))
const displayDate = computed(() => today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))

// 3. Filter slots so only today's schedules are visible
const todaysSlots = computed(() => {
  if (!props.appointmentSlots) return []
  return props.appointmentSlots.filter((slot: any) => slot.date === todayFormatted.value)
})
</script>

<template>
  <section class="overview-view">
    <header class="overview-header">
      <div class="header-titles">
        <h1 class="page-title">Welcome, Admin</h1>
        <p class="page-subtitle">Here is your dashboard overview for today.</p>
      </div>
      
      <div class="date-badge">
        <div class="date-badge__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="date-badge__text">
          <span class="date-badge__day">{{ displayDay }}</span>
          <span class="date-badge__date">{{ displayDate }}</span>
        </div>
      </div>
    </header>
    
    <div class="workspace-stack">
      <article class="clean-panel queue-panel">
        <div class="panel__header">
          <h2>Today's Queue</h2>
        </div>
        
        <div v-if="todaysSlots.length === 0" class="empty-state">
          No appointment for today.
        </div>
        
        <div v-else class="slot-summary">
          <div v-for="slot in todaysSlots" :key="slot.id" class="slot-row">
            <div class="slot-info">
              <span class="slot-label">{{ slot.type }}</span>
            </div>
            <div class="slot-stats">
              <strong>{{ slot.booked }} / {{ slot.capacity }}</strong>
              <span class="queued-label">Queued</span>
            </div>
          </div>
        </div>
      </article>

      <article class="announcements-section">
        <div class="section__header">
          <h2>Posted Announcements</h2>
          <button class="btn-flat" type="button" @click="emit('go-announcements')">
            Manage &rarr;
          </button>
        </div>
        
        <div v-if="!announcements || announcements.length === 0" class="empty-state">
          No announcements published yet.
        </div>
        
        <div v-else class="feed-list">
          <div 
            v-for="a in announcements.slice(0, 3)" 
            :key="a.id" 
            class="feed-card"
            :class="{ 'feed-card--pinned': a.is_pinned }"
          >
            <div class="feed-card__header">
              <div class="feed-card__meta">
                <span v-if="a.is_pinned" class="badge badge--pinned">📌 Pinned</span>
                <span :class="['badge', a.priority === 'High priority' ? 'badge--high' : 'badge--standard']">
                  {{ a.priority }}
                </span>
                <span class="date">{{ a.publishedAt }}</span>
              </div>
            </div>
            
            <h3 class="feed-card__title">{{ a.title }}</h3>
            <p class="feed-card__body">{{ a.body }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.overview-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header & Date Badge Styles */
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #191716;
  margin: 0;
}

.page-subtitle {
  margin: 0;
  color: #7A9E9F;
  font-size: 1rem;
  font-weight: 500;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #ffffff;
  border: 1px solid #E0E2DB;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.date-badge__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F6367;
  background: #E0E2DB;
  padding: 0.6rem;
  border-radius: 8px;
}

.date-badge__text {
  display: flex;
  flex-direction: column;
}

.date-badge__day {
  font-size: 1.1rem;
  font-weight: 800;
  color: #191716;
  line-height: 1.2;
}

.date-badge__date {
  font-size: 0.85rem;
  color: #7A9E9F;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Layout Stack */
.workspace-stack {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Light Theme Panels */
.clean-panel {
  background: #ffffff;
  border: 1px solid #7A9E9F;
  border-radius: 12px;
  padding: 1.5rem;
}

.queue-panel {
  border-color: #4F6367;
  box-shadow: 0 4px 16px rgba(79, 99, 103, 0.08);
}

.panel__header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 1.5rem; 
  border-bottom: 1px solid #E0E2DB; 
  padding-bottom: 1rem;
}

.panel__header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #191716;
}

/* Announcements Section (No Box) */
.announcements-section {
  display: flex;
  flex-direction: column;
}

.section__header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 1.25rem; 
}

.section__header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #191716;
}

.btn-flat {
  background: #4F6367;
  color: #E0E2DB;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.btn-flat:hover {
  opacity: 0.9;
}

/* Headcount List */
.slot-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.slot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid #E0E2DB;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s;
}

.slot-row:hover {
  border-color: #7A9E9F;
}

.slot-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.slot-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: #191716;
}

.slot-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.slot-stats strong {
  font-size: 1.4rem;
  color: #4F6367;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.queued-label {
  font-size: 0.75rem;
  color: #7A9E9F;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* Announcements Feed */
.empty-state {
  text-align: center;
  color: #7A9E9F;
  padding: 2.5rem 0;
  font-style: italic;
  font-size: 1.05rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #B8D8D8;
}

.feed-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Forces exactly two columns */
  gap: 1.5rem; /* Slightly increased gap for better spacing between columns */
}

.feed-card {
  padding: 1.25rem;
  border: 1px solid #E0E2DB;
  border-radius: 8px;
  background: #ffffff; /* Added white back in so the cards pop off the background */
  transition: box-shadow 0.2s, border-color 0.2s;
}

.feed-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.feed-card--pinned {
  border-color: #7A9E9F;
  box-shadow: 0 4px 12px rgba(122, 158, 159, 0.1);
}

.feed-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.feed-card__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.date {
  font-size: 0.8rem;
  color: #7A9E9F;
  font-weight: 500;
}

.badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.badge--standard {
  background: #E0E2DB;
  color: #4F6367;
}

.badge--high {
  background: rgba(79, 99, 103, 0.15);
  color: #191716;
}

.badge--pinned {
  background: #4F6367;
  color: #ffffff;
}

.feed-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #191716;
}

.feed-card__body {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(25, 23, 22, 0.8);
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 720px) {
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-badge {
    width: 100%;
  }

  .feed-list {
    grid-template-columns: 1fr; /* Stacks to 1 column on mobile devices */
  }
}
</style>
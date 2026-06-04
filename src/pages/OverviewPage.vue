<script setup lang="ts">
const props = defineProps([
  'announcements', 
  'checklistSteps', 
  'completedSteps', 
  'completionRate', 
  'appointmentSlots'
])

const emit = defineEmits<{
  (e: 'go-announcements'): void
}>()
</script>

<template>
  <section class="overview-view">
    <h1 class="welcome-title">Welcome, Admin</h1>
    
    <div class="metrics-grid">
      <article class="clean-card">
        <h3>Checklist Status</h3>
        <div class="progress-info">
          <span class="progress-ring__value">{{ completionRate }}%</span>
          <p>{{ completedSteps }} of {{ checklistSteps.length }} steps verified</p>
        </div>
      </article>

      <article class="clean-card">
        <h3>Expected Headcount</h3>
        <div class="slot-summary">
          <div v-for="slot in appointmentSlots" :key="slot.id" class="slot-row">
            <span class="slot-label">{{ slot.label }}</span>
            <strong>{{ slot.booked }} / {{ slot.capacity }}</strong>
          </div>
        </div>
      </article>
    </div>

    <div class="announcements-section">
      <div class="header-row">
        <h2>Post Announcements</h2>
        <button class="btn-text" type="button" @click="emit('go-announcements')">View All & Compose &rarr;</button>
      </div>
      
      <div class="announcement-feed">
        <article v-for="a in announcements.slice(0, 2)" :key="a.id" class="flat-announcement">
          <div class="flat-announcement__top">
            <strong>{{ a.priority }}</strong>
            <small>{{ a.publishedAt }}</small>
          </div>
          <h4>{{ a.title }}</h4>
          <p>{{ a.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.welcome-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #191716;
  margin: 0;
  letter-spacing: -0.02em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.clean-card {
  background-color: #E0E2DB;
  border: 1px solid rgba(122, 158, 159, 0.4); /* Subtle use of #7A9E9F */
  border-radius: 12px;
  padding: 1.5rem 2rem;
  min-height: 200px;
}

.clean-card h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #4F6367;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.progress-ring__value {
  font-size: 3.5rem;
  font-weight: 800;
  color: #191716;
  line-height: 1;
}

.progress-info p {
  color: #4F6367;
  font-weight: 500;
  margin: 0;
}

.slot-summary {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.slot-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(122, 158, 159, 0.3);
  padding-bottom: 0.5rem;
  color: #191716;
  font-size: 0.95rem;
}

.slot-row strong {
  color: #4F6367;
}

.announcements-section {
  margin-top: 1rem;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.header-row h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #191716;
  margin: 0;
}

.btn-text {
  background: none;
  border: none;
  color: #4F6367;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 0.9rem;
}

.btn-text:hover { 
  opacity: 0.7; 
}

.announcement-feed {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.flat-announcement {
  padding: 1.5rem;
  border: 1px solid #7A9E9F;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(25, 23, 22, 0.03);
}

.flat-announcement__top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: #4F6367;
}

.flat-announcement__top strong {
  background: #B8D8D8;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  color: #191716;
}

.flat-announcement h4 { 
  margin: 0 0 0.5rem; 
  color: #191716; 
  font-size: 1.1rem;
}

.flat-announcement p { 
  margin: 0; 
  font-size: 0.95rem; 
  color: rgba(25, 23, 22, 0.8); 
  line-height: 1.5;
}

@media (max-width: 900px) {
  .metrics-grid, .announcement-feed { grid-template-columns: 1fr; }
}
</style>
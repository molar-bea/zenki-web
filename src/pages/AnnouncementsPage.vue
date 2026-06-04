<script setup lang="ts">
const props = defineProps(['announcementDraft', 'announcements'])

const emit = defineEmits<{
  (e: 'publish'): void
}>()
</script>

<template>
  <section class="workspace-grid">
    <!-- Compose panel -->
    <article class="panel panel--builder">
      <div class="panel__header">
        <div>
          <p class="eyebrow">Campus announcements</p>
          <h2>Publish reminders and timeline updates</h2>
        </div>
        <button class="btn btn--primary-sm" type="button" @click="emit('publish')">Publish</button>
      </div>

      <label class="field field--dark">
        <span>Announcement title</span>
        <input v-model="announcementDraft.title" type="text" />
      </label>

      <label class="field field--dark">
        <span>Audience</span>
        <input v-model="announcementDraft.audience" type="text" />
      </label>

      <label class="field field--dark">
        <span>Message</span>
        <textarea v-model="announcementDraft.body" rows="5"></textarea>
      </label>

      <div class="priority-switcher">
        <button
          type="button"
          :class="['priority-chip', { 'priority-chip--active': announcementDraft.priority === 'High priority' }]"
          @click="announcementDraft.priority = 'High priority'"
        >
          🔴 High priority
        </button>
        <button
          type="button"
          :class="['priority-chip', { 'priority-chip--active': announcementDraft.priority === 'Standard' }]"
          @click="announcementDraft.priority = 'Standard'"
        >
          Standard
        </button>
      </div>
    </article>

    <!-- Feed panel -->
    <article class="panel panel--detail">
      <p class="eyebrow">Pinned feed</p>
      <h2>Announcements pushed to the student feed</h2>

      <div class="announcement-feed--stacked">
        <article
          v-for="a in announcements"
          :key="a.id"
          class="announcement-card announcement-card--stacked"
        >
          <div class="announcement-card__top">
            <span>{{ a.priority }}</span>
            <small>{{ a.publishedAt }}</small>
          </div>
          <h3>{{ a.title }}</h3>
          <p>{{ a.body }}</p>
          <footer>{{ a.audience }}</footer>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.workspace-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.priority-switcher {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.priority-chip {
  padding: 0.65rem 1rem;
  border: 1px solid rgba(79,99,103,0.22);
  border-radius: var(--radius-pill);
  background: rgba(79,99,103,0.06);
  color: var(--clr-ink);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  transition: background var(--transition), color var(--transition), transform var(--transition);
}

.priority-chip:hover { transform: translateY(-1px); }

.priority-chip--active {
  background: var(--clr-stone);
  color: var(--clr-fog);
  border-color: transparent;
}

.announcement-feed--stacked {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.announcement-card--stacked {
  background: rgba(79,99,103,0.08);
}

@media (max-width: 1180px) {
  .workspace-grid { grid-template-columns: 1fr; }
}
</style>

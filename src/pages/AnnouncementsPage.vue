<script setup lang="ts">
import type { AnnouncementView } from '../types/database.types'

const props = defineProps(['announcementDraft', 'announcements', 'isEditing'])

const emit = defineEmits<{
  (e: 'publish'): void
  (e: 'toggle-pin', id: string, currentState: boolean): void
  (e: 'edit', announcement: AnnouncementView): void
  (e: 'delete', id: string): void
  (e: 'cancel-edit'): void
}>()
</script>

<template>
  <section class="clean-view">
    <h1 class="page-title">Announcements</h1>

    <div class="workspace-grid">
      <!-- Compose panel -->
      <article class="clean-panel">
        <div class="panel__header">
          <h2>{{ isEditing ? 'Edit Announcement' : 'Draft Announcement' }}</h2>
          <div class="header-actions">
            <button v-if="isEditing" class="btn-flat btn-flat--cancel" type="button" @click="emit('cancel-edit')">
              Cancel
            </button>
            <button class="btn-flat" type="button" @click="emit('publish')">
              {{ isEditing ? 'Save Changes' : 'Publish' }}
            </button>
          </div>
        </div>

        <div class="form-body">
          <label class="field-light">
            <span>Announcement Title</span>
            <input v-model="announcementDraft.title" type="text" placeholder="e.g., Welcome to the new semester!" />
          </label>

          <label class="field-light">
            <span>Message Body</span>
            <textarea v-model="announcementDraft.body" rows="6" placeholder="Type your announcement here..."></textarea>
          </label>

          <div class="field-light">
            <span>Priority Level</span>
            <div class="priority-switcher">
              <button
                type="button"
                :class="['priority-chip', { 'priority-chip--active': announcementDraft.priority === 'High priority' }]"
                @click="announcementDraft.priority = 'High priority'"
              >
                High Priority
              </button>
              <button
                type="button"
                :class="['priority-chip', { 'priority-chip--active': announcementDraft.priority === 'Standard' }]"
                @click="announcementDraft.priority = 'Standard'"
              >
                Standard
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- Feed panel -->
      <article class="clean-panel">
        <div class="panel__header">
          <h2>Published Feed</h2>
        </div>

        <div v-if="announcements.length === 0" class="empty-state">
          No announcements published yet.
        </div>

        <div v-else class="feed-list">
          <div
            v-for="a in announcements"
            :key="a.id"
            class="feed-card"
            :class="{ 'feed-card--pinned': a.is_pinned }"
          >
            <div class="feed-card__header">
              <div class="feed-card__meta">
                <span :class="['badge', a.priority === 'High priority' ? 'badge--high' : 'badge--standard']">
                  {{ a.priority }}
                </span>
                <span class="date">{{ a.publishedAt }}</span>
              </div>
              
              <div class="action-group">
                <button class="icon-btn" @click="emit('edit', a)" title="Edit announcement">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn--delete" @click="emit('delete', a.id)" title="Delete announcement">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
                <button 
                  class="pin-btn" 
                  :class="{ 'pin-btn--active': a.is_pinned }"
                  @click="emit('toggle-pin', a.id, a.is_pinned)"
                  :title="a.is_pinned ? 'Unpin announcement' : 'Pin announcement'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                  </svg>
                </button>
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
.clean-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-title { 
  font-family: 'Inter', system-ui, sans-serif; 
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  color: #191716;
  margin: 0; 
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* Light Theme Panels */
.clean-panel { 
  background: #ffffff; 
  border: 1px solid #7A9E9F; 
  border-radius: 12px; 
  padding: 1.5rem; 
  min-height: 200px;
}

.panel__header { 
  display: flex;
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #E0E2DB;
  padding-bottom: 1rem;
  gap: 0.75rem;
}

.panel__header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #191716;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.4rem;
}

.btn-flat { 
  background: #4F6367;
  color: #E0E2DB;
  border: none;
  padding: 0.55rem 1rem; 
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: opacity 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.btn-flat:hover { opacity: 0.9; }

.btn-flat--cancel {
  background: transparent;
  color: #4F6367;
  border: 1px solid #B8D8D8;
}

.btn-flat--cancel:hover { background: #E0E2DB; }

/* Light Forms */
.form-body { display: flex; flex-direction: column; gap: 1.25rem; }
.field-light { display: flex; flex-direction: column; gap: 0.4rem; }

.field-light span {
  font-size: 0.82rem;
  font-weight: 600;
  color: #4F6367;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-light input, .field-light textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #B8D8D8;
  border-radius: 8px;
  background: #fcfcfc;
  color: #191716;
  font-size: max(0.95rem, 16px);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.field-light input:focus, .field-light textarea:focus { border-color: #4F6367; }

/* Priority Toggle */
.priority-switcher { display: flex; gap: 0.5rem; }

.priority-chip {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #B8D8D8;
  border-radius: 6px;
  background: transparent;
  color: #4F6367;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.priority-chip--active { background: #4F6367; color: #ffffff; border-color: #4F6367; }

/* Feed List */
.empty-state { text-align: center; color: #7A9E9F; padding: 2rem 0; font-style: italic; }
.feed-list { display: flex; flex-direction: column; gap: 1rem; }

.feed-card {
  padding: 1.25rem;
  border: 1px solid #E0E2DB;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s;
}

.feed-card--pinned {
  border-color: #7A9E9F;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(122, 158, 159, 0.1);
}

.feed-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.feed-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 0;
}

.date { font-size: 0.75rem; color: #7A9E9F; font-weight: 500; }
.badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 4px; }
.badge--standard { background: #E0E2DB; color: #4F6367; }
.badge--high { background: rgba(79, 99, 103, 0.15); color: #191716; }

/* Actions */
.action-group { display: flex; gap: 0.25rem; align-items: center; flex-shrink: 0; }

.icon-btn, .pin-btn {
  background: transparent;
  border: none;
  color: #B8D8D8;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: grid;
  place-items: center;
}

.icon-btn:hover, .pin-btn:hover { color: #7A9E9F; background: #E0E2DB; }
.icon-btn--delete:hover { background: rgba(211, 47, 47, 0.1); color: #d32f2f; }
.pin-btn--active { color: #4F6367; }

.feed-card__title { margin: 0 0 0.5rem; font-size: 1rem; color: #191716; }
.feed-card__body { margin: 0; font-size: 0.9rem; line-height: 1.5; color: rgba(25, 23, 22, 0.8); white-space: pre-wrap; }

/* ── Responsive ──────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .workspace-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .clean-panel { padding: 1.1rem; }

  .panel__header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
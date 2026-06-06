<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useEnrollStore } from '../composables/useEnrollStore'
import type { AppointmentScheduleView } from '../types/database.types'

const store = reactive(useEnrollStore())

const editingId = ref<string | null>(null)
const editCapacity = ref<number>(0)

function startEdit(id: string, currentCap: number) {
  editingId.value = id
  editCapacity.value = currentCap
}

async function saveEdit() {
  if (!editingId.value) return
  await store.updateScheduleCapacity(editingId.value, editCapacity.value)
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

const activeFilter = ref<string>('All')

const filteredSchedules = computed(() => {
  if (activeFilter.value === 'All') return store.appointmentSchedules
  return store.appointmentSchedules.filter((s: AppointmentScheduleView) => s.type === activeFilter.value)
})

function fillPct(booked: number, capacity: number) {
  if (capacity === 0) return 0
  return Math.min((booked / capacity) * 100, 100)
}
</script>

<template>
  <section class="clean-view">
    <h1 class="page-title">Manage Appointment Days</h1>
    
    <div class="workspace-grid">
      <!-- Compose panel: Open a Day -->
      <article class="clean-panel">
        <div class="panel__header">
          <h2>Open New Days</h2>
          <button class="btn-flat" type="button" @click="store.openAppointmentDay">
            Open Schedule
          </button>
        </div>

        <div class="form-body">
          <label class="field-light">
            <span>Appointment Type</span>
            <div class="priority-switcher">
              <button
                type="button"
                :class="['priority-chip', { 'priority-chip--active': store.scheduleDraft.type === 'Medical Appointment' }]"
                @click="store.scheduleDraft.type = 'Medical Appointment'"
              >
                Medical Exam
              </button>
              <button
                type="button"
                :class="['priority-chip', { 'priority-chip--active': store.scheduleDraft.type === 'Document Submission' }]"
                @click="store.scheduleDraft.type = 'Document Submission'"
              >
                Doc Drop-off
              </button>
            </div>
          </label>

          <div class="form-dates-row">
            <label class="field-light">
              <span>Start Date</span>
              <input v-model="store.scheduleDraft.startDate" type="date" />
            </label>
            <label class="field-light">
              <span>End Date</span>
              <input v-model="store.scheduleDraft.endDate" type="date" />
            </label>
          </div>

          <label class="field-light">
            <span>Daily Student Capacity Limit</span>
            <input v-model.number="store.scheduleDraft.capacity" type="number" min="1" />
          </label>
        </div>
      </article>

      <!-- Feed panel: Managed Days -->
      <article class="clean-panel">
        <div class="panel__header">
          <h2>Currently Managed Days</h2>
        </div>

        <!-- Filter controls -->
        <div class="filter-row">
          <button
            :class="['filter-chip', activeFilter === 'All' ? 'filter-chip--active' : '']"
            @click="activeFilter = 'All'"
          >All</button>
          <button
            :class="['filter-chip', activeFilter === 'Medical Appointment' ? 'filter-chip--active' : '']"
            @click="activeFilter = 'Medical Appointment'"
          >Medical</button>
          <button
            :class="['filter-chip', activeFilter === 'Document Submission' ? 'filter-chip--active' : '']"
            @click="activeFilter = 'Document Submission'"
          >Doc Drop-off</button>
        </div>

        <div v-if="filteredSchedules.length === 0" class="empty-state">
          No schedule days found for this category.
        </div>

        <div v-else class="compact-list">
          <div
            v-for="schedule in filteredSchedules"
            :key="schedule.id"
            class="compact-card"
            :class="{ 'compact-card--editing': editingId === schedule.id }"
          >
            <!-- Left Side: Info -->
            <div class="compact-card__info">
              <h3 class="compact-date">{{ schedule.date }}</h3>
              <span :class="['badge', schedule.type === 'Medical Appointment' ? 'badge--medical' : 'badge--document']">
                {{ schedule.type }}
              </span>
            </div>

            <!-- Right Side: Stats & Actions -->
            <div class="compact-card__controls">
              <div class="compact-stats">
                <div class="slot-meta">
                  <span class="meta-label">Queued:</span>
                  <strong v-if="editingId !== schedule.id">{{ schedule.booked }} / {{ schedule.capacity }}</strong>
                  <div v-else class="inline-edit-group">
                    <span>{{ schedule.booked }} / </span>
                    <input v-model.number="editCapacity" type="number" min="1" class="inline-input" />
                  </div>
                </div>
                <div class="slot-meter-clean">
                  <div class="slot-meter-clean__fill" :style="{ width: `${fillPct(schedule.booked, schedule.capacity)}%` }"></div>
                </div>
              </div>

              <div class="action-group">
                <button v-if="editingId !== schedule.id" class="icon-btn" @click="startEdit(schedule.id, schedule.capacity)" title="Edit Capacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>

                <template v-else>
                  <button class="icon-btn icon-btn--cancel" @click="cancelEdit" title="Cancel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <button class="icon-btn icon-btn--save" @click="saveEdit" title="Save changes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                </template>

                <button class="icon-btn icon-btn--delete" @click="store.removeAppointmentDay(schedule.id)" title="Close this day">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.clean-view { display: flex; flex-direction: column; gap: 2rem; }

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

.field-light input {
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

.field-light input:focus { border-color: #4F6367; }

.form-dates-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Priority Toggle */
.priority-switcher { display: flex; gap: 0.5rem; }

.priority-chip {
  flex: 1;
  padding: 0.6rem 0.5rem;
  border: 1px solid #B8D8D8;
  border-radius: 6px;
  background: transparent;
  color: #4F6367;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  text-align: center;
}

.priority-chip--active { background: #4F6367; color: #ffffff; border-color: #4F6367; }

/* Filters */
.filter-row { 
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.25rem; 
  background: #E0E2DB;
  padding: 0.3rem;
  border-radius: 8px; 
}

.filter-chip { 
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.45rem 0.4rem; 
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4F6367; 
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.filter-chip:hover { color: #191716; }
.filter-chip--active { background: #ffffff; color: #191716; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

/* Feed List - Compact Mode */
.empty-state { text-align: center; color: #7A9E9F; padding: 2rem 0; font-style: italic; }
.compact-list { display: flex; flex-direction: column; gap: 0.6rem; }

.compact-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #E0E2DB;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s;
  gap: 1rem;
}

.compact-card--editing {
  border-color: #4F6367;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(122, 158, 159, 0.15);
}

.compact-card__info { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; flex: 1; }
.compact-date { margin: 0; font-size: 0.9rem; font-weight: 700; color: #191716; }

.badge { 
  font-size: 0.65rem; 
  font-weight: 700; 
  text-transform: uppercase; 
  padding: 0.2rem 0.5rem; 
  border-radius: 4px; 
  display: inline-block; 
  width: max-content; 
}

.badge--medical { 
  background: rgba(122, 158, 159, 0.2); 
  color: #1a3637; 
  border: 1px solid rgba(122, 158, 159, 0.4);
}

.badge--document { 
  background: rgba(224, 226, 219, 0.7); 
  color: #3b4243;
  border: 1px solid rgba(184, 216, 216, 0.8);
}

.compact-card__controls { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
.compact-stats { width: 110px; display: flex; flex-direction: column; gap: 0.35rem; }

.slot-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(25, 23, 22, 0.8);
}

.meta-label { color: #7A9E9F; font-weight: 600; }
.slot-meta strong { color: #191716; }

.inline-edit-group { display: flex; align-items: center; gap: 0.25rem; }

.inline-input { 
  width: 46px;
  padding: 0.1rem 0.3rem;
  border: 1px solid #7A9E9F; 
  border-radius: 4px;
  font-size: 0.8rem;
  outline: none;
  font-family: inherit;
  font-weight: 600;
}

.inline-input:focus { border-color: #4F6367; }

.slot-meter-clean { height: 4px; background: #E0E2DB; border-radius: 4px; overflow: hidden; }
.slot-meter-clean__fill { height: 100%; background: #4F6367; transition: width 0.3s ease; }

/* Actions */
.action-group { display: flex; gap: 0.15rem; align-items: center; }

.icon-btn {
  background: transparent;
  border: none;
  color: #B8D8D8;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: grid;
  place-items: center;
}

.icon-btn:hover { color: #7A9E9F; background: #E0E2DB; }
.icon-btn--delete:hover { background: rgba(211, 47, 47, 0.1); color: #d32f2f; }
.icon-btn--save { color: #2e7d32; }
.icon-btn--save:hover { background: rgba(46, 125, 50, 0.1); }
.icon-btn--cancel:hover { background: rgba(25, 23, 22, 0.1); color: #191716; }

/* ── Responsive ──────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .workspace-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .clean-panel { padding: 1.1rem; }

  .compact-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .compact-card__controls {
    width: 100%;
    justify-content: space-between;
  }

  .compact-stats {
    width: auto;
    flex: 1;
  }

  .form-dates-row {
    grid-template-columns: 1fr;
  }
}
</style>
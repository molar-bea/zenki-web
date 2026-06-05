<script setup lang="ts">
import { computed } from 'vue'
import type { ChecklistStep } from '../types/database.types'

const props = defineProps<{
  checklistSteps: ChecklistStep[]
  activeStepId: string | null
  completionRate: number
  studentTimeline: Array<{ id: string; order: number; title: string; status: string; active?: boolean }>
}>()

const emit = defineEmits<{
  (e: 'add-step'): void
  (e: 'activate-step', id: string): void
  (e: 'toggle-status', id: string): void
}>()

const activeStep = computed(() => props.checklistSteps.find((s) => s.id === props.activeStepId))
const activeStepIndex = computed(() => props.checklistSteps.findIndex((s) => s.id === props.activeStepId) + 1)

function getStepBadgeClass(status: ChecklistStep['status']) {
  if (status === 'completed') return 'badge-clean--done'
  if (status === 'in-review') return 'badge-clean--progress'
  return 'badge-clean--pending'
}
function padIndex(i: number) { return String(i).padStart(2, '0') }
</script>

<template>
  <section class="clean-view">
    <h1 class="page-title">Checklist Configuration</h1>

    <div class="workspace-grid">
      <article class="clean-panel">
        <div class="panel__header">
          <h2>Enrollment Sequence</h2>
          <button class="btn-flat" type="button" @click="emit('add-step')">+ Add step</button>
        </div>
        <div class="step-list">
          <button
            v-for="(step, index) in checklistSteps"
            :key="step.id"
            type="button"
            class="step-card-clean"
            :class="{ 'step-card-clean--active': step.id === activeStepId }"
            @click="emit('activate-step', step.id)"
          >
            <div class="step-index">{{ padIndex(index + 1) }}</div>
            <div class="step-content">
              <div class="step-row">
                <strong>{{ step.title }}</strong>
                <span class="badge-clean" :class="getStepBadgeClass(step.status)">{{ step.status }}</span>
              </div>
              <p>{{ step.description }}</p>
            </div>
            <span class="step-action" @click.stop="emit('toggle-status', step.id)">Toggle</span>
          </button>
        </div>
      </article>

      <article class="clean-panel">
        <div v-if="activeStep">
          <h2>Add Requirement</h2>
          
          <div class="field field--dark">
            <span>Title</span>
            <input v-model="activeStep.title" type="text" />
          </div>

          <div class="field field--dark">
            <span>Description</span>
            <textarea v-model="activeStep.description" rows="4"></textarea>
          </div>

          <div class="date-row">
            <div class="field field--dark">
              <span>Start Date</span>
              <input v-model="activeStep.startDate" type="date" />
            </div>
            <div class="field field--dark">
              <span>End Date</span>
              <input v-model="activeStep.endDate" type="date" />
            </div>
          </div>

          <button class="btn--primary" style="margin-top: 1.5rem;">
            Save changes
          </button>
        </div>
        <div v-else>
          <p class="detail-copy">Select a step to view details.</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.clean-view { display: flex; flex-direction: column; gap: 2rem; }
.page-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #191716;
  margin: 0;
}
.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.clean-panel {
  background: #ffffff;
  border: 1px solid #7A9E9F;
  border-radius: 12px;
  padding: 1.5rem;
}
.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.panel__header h2 { margin: 0; font-size: 1.2rem; color: #191716; }
.btn-flat {
  background: #4F6367;
  color: #E0E2DB;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.step-list { display: flex; flex-direction: column; gap: 1rem; }
.step-card-clean {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #E0E2DB;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.step-card-clean:hover { border-color: #7A9E9F; }
.step-card-clean--active {
  border-color: #4F6367;
  background: rgba(184, 216, 216, 0.2); /* Soft #B8D8D8 */
}
.step-index {
  background: #E0E2DB;
  color: #191716;
  display: grid;
  place-items: center;
  border-radius: 6px;
  font-weight: bold;
}
.step-row { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.step-row strong { color: #191716; }
.step-content p { margin: 0; font-size: 0.85rem; color: rgba(25, 23, 22, 0.7); }
.step-action { color: #7A9E9F; font-size: 0.8rem; font-weight: 600; }

.badge-clean { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
.badge-clean--done { background: #7A9E9F; color: #ffffff; }
.badge-clean--progress { background: #B8D8D8; color: #191716; }
.badge-clean--pending { background: #E0E2DB; color: #4F6367; }

/* New date row style added here */
.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.timeline-clean { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.timeline-item { display: flex; gap: 1rem; align-items: center; opacity: 0.5; }
.timeline-item--active { opacity: 1; }
.timeline-num {
  width: 32px; height: 32px;
  background: #E0E2DB;
  color: #4F6367;
  display: grid; place-items: center;
  border-radius: 50%; font-weight: bold;
}
.timeline-item strong { color: #191716; }
</style>
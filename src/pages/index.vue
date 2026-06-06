<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import { useEnrollStore } from '../composables/useEnrollStore'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'

const store = reactive(useEnrollStore())
const router = useRouter()
const route = useRoute()

onMounted(() => store.restoreSession())

// This watches the URL so if you refresh the page, the sidebar stays on the right highlight!
watch(() => route.name, (newName) => {
  if (newName === 'Overview') store.activeSection = 'overview'
  if (newName === 'Checklist') store.activeSection = 'checklist'
  if (newName === 'Announcements') store.activeSection = 'announcements'
  if (newName === 'Appointments') store.activeSection = 'appointments'
}, { immediate: true })

function handleNavigate(section: string) {
  if (section === 'overview') router.push('/dashboard')
  else router.push(`/dashboard/${section}`)
}

async function handleSignOut() {
  await store.signOut()
  router.push('/')
}
</script>

<template>
  <div class="shell">
    <Transition name="toast">
      <div v-if="store.toastVisible" :class="['toast', store.toastType === 'error' ? 'toast--error' : 'toast--success']">
        <span class="toast-icon">{{ store.toastType === 'error' ? '✕' : '✓' }}</span>
        {{ store.toastMsg }}
      </div>
    </Transition>

    <section class="dashboard">
      <AppSidebar
        :active-section="store.activeSection"
        @navigate="handleNavigate"
        @sign-out="handleSignOut"
      />

      <main class="dashboard__main">
        <router-view 
          :announcements="store.announcements"
          :checklist-steps="store.checklistSteps"
          :completed-steps="store.completedSteps"
          :completion-rate="store.completionRate"
          :appointment-slots="store.appointmentSchedules"
          :active-step-id="store.activeStepId"
          :student-timeline="store.studentTimeline"
          :announcement-draft="store.announcementDraft"
          :is-editing="!!store.editingAnnouncementId"
          @go-announcements="handleNavigate('announcements')"
          @add-step="store.addChecklistStep"
          @activate-step="store.activateStep"
          @remove-step="store.removeChecklistStep"
          @publish="store.publishAnnouncement"
          @toggle-pin="store.togglePin"
          @edit="store.startEditAnnouncement"
          @delete="store.deleteAnnouncement"
          @cancel-edit="store.cancelEditAnnouncement"
        />
      </main>
    </section>
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; }
.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  background-color: #ffffff;
}
.dashboard__main {
  padding: 3rem 4rem;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
/* ── Global Toast ──────────────────────────────────────────────────────────── */
.toast {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  box-shadow: var(--shadow-card);
  min-width: 280px;
}

.toast--success {
  background: var(--clr-mist);
  color: var(--clr-ink);
  border: 1px solid var(--clr-slate);
}

.toast--error {
  background: rgba(255,235,235,0.97);
  color: #7a2020;
  border: 1px solid rgba(200,80,80,0.3);
}

.toast-icon {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  font-size: 0.7rem;
  font-weight: 800;
  flex-shrink: 0;
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-12px) scale(0.97); }

@media (max-width: 1180px) {
  .dashboard { grid-template-columns: 1fr; }
  .dashboard__main { padding: 2rem; }
}
</style>
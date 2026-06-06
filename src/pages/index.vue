<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useEnrollStore } from '../composables/useEnrollStore.ts'
import { useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'

// 2. Wrap the composable in reactive() so the templates can read the data natively
const store = reactive(useEnrollStore())

// Restore an existing Supabase session on page load
onMounted(() => store.restoreSession())
</script>

<template>
  <div class="shell">
    <Transition name="toast">
      <div v-if="store.toastVisible" :class="['toast', store.toastType === 'error' ? 'toast--error' : 'toast--success']">
        <span class="toast-icon">{{ store.toastType === 'error' ? '✕' : '✓' }}</span>
        {{ store.toastMsg }}
      </div>
    </Transition>
    <LoginPage
      v-if="!store.loggedIn"
      :login-form="store.loginForm"
      :login-error="store.loginError"
      :is-loading="store.isLoading"
      @sign-in="store.signIn"
    />

    <section v-else class="dashboard">
        <AppSidebar
        :active-section="store.activeSection"
        @navigate="(s:string) => (store.activeSection = s as any)"
        @sign-out="store.signOut"
      />

      <main class="dashboard__main">

        <OverviewPage
          v-if="store.activeSection === 'overview'"
          :announcements="store.announcements"
          :checklist-steps="store.checklistSteps"
          :completed-steps="store.completedSteps"
          :completion-rate="store.completionRate"
          :appointment-slots="store.appointmentSchedules"
          @go-announcements="() => (store.activeSection = 'announcements')"
        />
        <ChecklistPage
          v-else-if="store.activeSection === 'checklist'"
          :checklist-steps="store.checklistSteps"
          :active-step-id="store.activeStepId"
          :completion-rate="store.completionRate"
          :student-timeline="store.studentTimeline"
          @add-step="store.addChecklistStep"
          @activate-step="store.activateStep"
          @remove-step="store.removeChecklistStep"
        />
       <AnnouncementsPage
          v-else-if="store.activeSection === 'announcements'"
          :announcement-draft="store.announcementDraft"
          :announcements="store.announcements"
          :is-editing="!!store.editingAnnouncementId"
          @publish="store.publishAnnouncement"
          @toggle-pin="store.togglePin"
          @edit="store.startEditAnnouncement"
          @delete="store.deleteAnnouncement"
          @cancel-edit="store.cancelEditAnnouncement"
        />
        <AppointmentsPage
          v-else
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
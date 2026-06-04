<script setup lang="ts">
import { reactive } from 'vue'
import { useEnrollStore } from '../composables/useEnrollStore.ts'
import LoginPage from './LoginPage.vue'
import OverviewPage from './OverviewPage.vue'
import ChecklistPage from './ChecklistPage.vue'
import AnnouncementsPage from './AnnouncementsPage.vue'
import AppointmentsPage from './AppointmentsPage.vue'
import AppSidebar from '../components/AppSidebar.vue'

const store = reactive(useEnrollStore())
</script>

<template>
  <div class="shell">
    <LoginPage
      v-if="!store.loggedIn"
      :login-form="store.loginForm"
      @sign-in="store.signIn"
    />

    <section v-else class="dashboard">
      <AppSidebar
        :active-section="store.activeSection"
        @navigate="(s) => (store.activeSection = s)"
        @sign-out="() => (store.loggedIn = false)"
      />

      <main class="dashboard__main">
        <div v-if="store.allStepsCompleted" class="success-banner">
          <strong>Congrats, the enrollment process is complete.</strong>
          <span>Good luck with your journey!</span>
        </div>

        <OverviewPage
          v-if="store.activeSection === 'overview'"
          :announcements="store.announcements"
          :checklist-steps="store.checklistSteps"
          :completed-steps="store.completedSteps"
          :completion-rate="store.completionRate"
          :appointment-slots="store.appointmentSlots"
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
          @toggle-status="store.toggleChecklistStatus"
        />
        <AnnouncementsPage
          v-else-if="store.activeSection === 'announcements'"
          :announcement-draft="store.announcementDraft"
          :announcements="store.announcements"
          @publish="store.publishAnnouncement"
        />
        <AppointmentsPage
          v-else
          :appointment-slots="store.appointmentSlots"
          :selected-slot-id="store.selectedSlotId"
          :active-slot="store.activeSlot"
          @select-slot="(id) => (store.selectedSlotId = id)"
          @reserve-slot="store.reserveSlot"
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
@media (max-width: 1180px) {
  .dashboard { grid-template-columns: 1fr; }
  .dashboard__main { padding: 2rem; }
}
</style>
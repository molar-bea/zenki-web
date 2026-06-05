<script setup lang="ts">
import { reactive } from 'vue' // 1. Import reactive
import { useEnrollStore } from '../composables/useEnrollStore.ts'
import { useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'

// 2. Wrap the composable in reactive() so the templates can read the data natively
const store = reactive(useEnrollStore())
const router = useRouter()

function goToAnnouncements() {
  router.push('/dashboard/announcements')
}

function selectSlot(slotId: number) {
  // 3. Remove .value here, because reactive() handles it under the hood now!
  store.selectedSlotId = slotId 
}
</script>

<template>
  <div class="shell">
    <section class="dashboard">
      <AppSidebar />

      <main class="dashboard__main">
        <div v-if="store.allStepsCompleted" class="success-banner">
          <strong>Congrats, the enrollment process is complete.</strong>
          <span>Good luck with your journey!</span>
        </div>

        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            :announcements="store.announcements"
            :checklist-steps="store.checklistSteps"
            :completed-steps="store.completedSteps"
            :completion-rate="store.completionRate"
            :appointment-slots="store.appointmentSlots"
            :announcement-draft="store.announcementDraft"
            :selected-slot-id="store.selectedSlotId"
            :active-slot="store.activeSlot"
            :active-step-id="store.activeStepId"
            :student-timeline="store.studentTimeline"
            @go-announcements="goToAnnouncements"
            @publish="store.publishAnnouncement"
            @add-step="store.addChecklistStep"
            @activate-step="store.activateStep"
            @toggle-status="store.toggleChecklistStatus"
            @select-slot="selectSlot"
            @reserve-slot="store.reserveSlot"
          />
        </router-view>
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
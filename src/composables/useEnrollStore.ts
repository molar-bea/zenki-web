import { computed, reactive, ref } from 'vue'
import type { Announcement, AnnouncementPriority, AppointmentSlot, ChecklistStep, StepStatus } from '../types'

export function useEnrollStore() {
  const loggedIn = ref(false)
  const activeSection = ref('overview')
  const activeStepId = ref(1)

  const loginForm = reactive({
    username: 'Administrator1',
    password: '',
  })

  const checklistSteps = ref<ChecklistStep[]>([
    { id: 1, title: 'Pass Documents', description: 'Review original copies, admission forms, and supporting records.', status: 'completed' },
    { id: 2, title: 'Medical Exam', description: 'Queue the student for physical screening and health clearance.', status: 'in-review' },
    { id: 3, title: 'Payment Confirmation', description: 'Verify tuition and enrollment fees before final approval.', status: 'pending' },
    { id: 4, title: 'Orientation Release', description: 'Unlock the final clearance and send the completion notice.', status: 'pending' },
  ])

  const announcementDraft = reactive({
    title: 'Exam Schedule Timeline',
    audience: 'All enrolled students',
    body: 'The medical exam queue opens at 8:00 AM. Bring valid ID, payment receipt, and completed forms.',
    priority: 'High priority' as AnnouncementPriority,
  })

  const announcements = ref<Announcement[]>([
    { id: 1, title: 'Medical Requirements Updated', audience: 'Incoming freshmen', publishedAt: 'Today, 08:20 AM', body: 'The clinic now requires one printed copy of the updated physical form before screening.', priority: 'High priority' },
    { id: 2, title: 'Enrollment Window Reminder', audience: 'All students', publishedAt: 'Yesterday, 04:40 PM', body: 'Enrollment verification closes at 5:00 PM every Friday to keep the campus queue manageable.', priority: 'Standard' },
  ])

  const appointmentSlots = ref<AppointmentSlot[]>([
    { id: 1, label: 'Document Submission', date: 'June 8', time: '09:00 AM - 10:30 AM', requirement: 'Pass Documents', booked: 18, capacity: 24 },
    { id: 2, label: 'Medical Screening', date: 'June 8', time: '11:00 AM - 01:00 PM', requirement: 'Medical Exam', booked: 12, capacity: 18 },
    { id: 3, label: 'Cashier Review', date: 'June 9', time: '09:30 AM - 11:30 AM', requirement: 'Payment Confirmation', booked: 9, capacity: 16 },
  ])

  const selectedSlotId = ref(2)

  // Computed
  const activeSlot = computed(() =>
    appointmentSlots.value.find((s) => s.id === selectedSlotId.value) ?? appointmentSlots.value[0]
  )
  const totalStudents = computed(() => 284)
  const checkedInStudents = computed(() => 198)
  const completedSteps = computed(() => checklistSteps.value.filter((s) => s.status === 'completed').length)
  const completionRate = computed(() => Math.round((completedSteps.value / checklistSteps.value.length) * 100))
  const allStepsCompleted = computed(() => completedSteps.value === checklistSteps.value.length)
  const studentTimeline = computed(() =>
    checklistSteps.value.map((step, i) => ({ ...step, order: i + 1, active: step.id === activeStepId.value }))
  )

  // Actions
  function signIn() {
    loggedIn.value = true
    activeSection.value = 'overview'
  }

  function publishAnnouncement() {
    announcements.value.unshift({
      id: Date.now(),
      title: announcementDraft.title,
      audience: announcementDraft.audience,
      publishedAt: 'Just now',
      body: announcementDraft.body,
      priority: announcementDraft.priority,
    })
    announcementDraft.title = 'Timeline Update'
    announcementDraft.audience = 'All students'
    announcementDraft.body = 'Please check the latest enrollment instructions before visiting campus.'
    announcementDraft.priority = 'Standard'
  }

  function addChecklistStep() {
    checklistSteps.value.push({
      id: Date.now(),
      title: `New Step ${checklistSteps.value.length + 1}`,
      description: 'Define the next enrollment action or verification requirement.',
      status: 'pending',
    })
  }

  function toggleChecklistStatus(stepId: number) {
    checklistSteps.value = checklistSteps.value.map((step) => {
      if (step.id !== stepId) return step
      const next: StepStatus = step.status === 'pending' ? 'in-review' : step.status === 'in-review' ? 'completed' : 'pending'
      return { ...step, status: next }
    })
  }

  function activateStep(stepId: number) {
    activeStepId.value = stepId
  }

  function reserveSlot(slotId: number) {
    appointmentSlots.value = appointmentSlots.value.map((slot) => {
      if (slot.id !== slotId || slot.booked >= slot.capacity) return slot
      return { ...slot, booked: slot.booked + 1 }
    })
  }

  function getStepBadgeClass(status: StepStatus) {
    if (status === 'completed') return 'badge--done'
    if (status === 'in-review') return 'badge--progress'
    return 'badge--pending'
  }

  return {
    // State
    loggedIn, activeSection, activeStepId, loginForm,
    checklistSteps, announcementDraft, announcements, appointmentSlots, selectedSlotId,
    // Computed
    activeSlot, totalStudents, checkedInStudents, completedSteps, completionRate, allStepsCompleted, studentTimeline,
    // Actions
    signIn, publishAnnouncement, addChecklistStep, toggleChecklistStatus, activateStep, reserveSlot, getStepBadgeClass,
  }
}

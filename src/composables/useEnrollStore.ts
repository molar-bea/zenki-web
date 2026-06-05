import { ref, computed } from 'vue'
import { signIn, signOut, getSession, fetchUserProfile } from '../services/Authservice'
import { fetchAnnouncements, publishAnnouncement as publishAnnouncementService,updateAnnouncement as updateAnnouncementService,toggleAnnouncementPin,retractAnnouncement } from '../services/Announcementservice'
import { fetchChecklistSteps, addChecklistStep as addStepService, deleteChecklistStep, reorderChecklistSteps } from '../services/Checklistservice'
import { fetchAppointmentSlots, createAppointmentSlot, cancelAppointmentSlot } from '../services/Appointmentservice'
import type {
  AnnouncementView,
  AnnouncementDraft,
  ChecklistStep,
  AppointmentSlot,
  AppointmentType,
} from '../types/database.types'

// ─── Auth state ───────────────────────────────────────────────────────────────

const loggedIn       = ref(false)
const currentUserId  = ref<string | null>(null)
const currentUserName = ref<string>('Admin')
const loginError     = ref<string | null>(null)
const isLoading      = ref(false)
const loginForm      = ref({ email: '', password: '' })

// ─── Navigation ───────────────────────────────────────────────────────────────

const activeSection = ref<'overview' | 'checklist' | 'announcements' | 'appointments'>('overview')

// Global Toast State
  const toastMsg     = ref('')
  const toastType    = ref<'success' | 'error'>('success')
  const toastVisible = ref(false)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    toastMsg.value     = msg
    toastType.value    = type
    toastVisible.value = true
    setTimeout(() => { toastVisible.value = false }, 3500)
  }

// ─── Use case 2: Announcements ────────────────────────────────────────────────

const announcements = ref<AnnouncementView[]>([])
  const announcementDraft = ref<AnnouncementDraft>({
    title: '',
    body: '',
    priority: 'Standard',
  })

const editingAnnouncementId = ref<string | null>(null)


// ─── Use case 1: Checklist configuration ─────────────────────────────────────

const checklistSteps = ref<ChecklistStep[]>([])
const activeStepId   = ref<string | null>(null)


// ─── Use case 3: Appointment scheduling ──────────────────────────────────────

const appointmentSlots = ref<AppointmentSlot[]>([])
const selectedSlotId   = ref<string | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

// Overview card: how many steps have been defined
const totalSteps = computed(() => checklistSteps.value.length)

// Overview card: completion % across the defined steps
// (Admin view — always shows 0 until students start completing steps)
const completedSteps = computed(
  () => checklistSteps.value.filter((s) => s.status === 'completed').length,
)
const completionRate = computed(() =>
  totalSteps.value === 0
    ? 0
    : Math.round((completedSteps.value / totalSteps.value) * 100),
)

// Triggers the success banner when every step is completed
const allStepsCompleted = computed(
  () => totalSteps.value > 0 && completedSteps.value === totalSteps.value,
)

// The slot card the admin has selected in AppointmentsPage
const activeSlot = computed(
  () => appointmentSlots.value.find((s) => s.id === selectedSlotId.value) ?? null,
)

// Timeline fed to the right-hand panel on ChecklistPage
const studentTimeline = computed(() =>
  checklistSteps.value.map((s, i) => ({
    id: s.id,
    order: i + 1,
    title: s.title,
    status: s.status,
    active: s.id === activeStepId.value,
  })),
)

// ─── Auth actions ─────────────────────────────────────────────────────────────

async function signInAction() {
  loginError.value = null
  isLoading.value  = true
  try {
    const session = await signIn(loginForm.value.email, loginForm.value.password)
    if (!session) throw new Error('Login failed — no session returned.')

    const profile = await fetchUserProfile(session.user.id)
    if (!profile || profile.role !== 'admin') {
      await signOut()
      throw new Error('Access denied: admin accounts only.')
    }

    currentUserId.value   = session.user.id
    currentUserName.value = profile.full_name ?? currentUserName.value
    loggedIn.value        = true
    loginForm.value       = { email: '', password: '' }

    // Load all three sections in parallel on login
    await Promise.all([
      loadAnnouncements(),
      loadChecklistSteps(),
      loadAppointmentSlots(),
    ])
  } catch (err: unknown) {
    loginError.value = err instanceof Error ? err.message : 'Sign-in failed.'
  } finally {
    isLoading.value = false
  }
}

async function signOutAction() {
  await signOut()
  loggedIn.value        = false
  currentUserId.value   = null
  announcements.value   = []
  checklistSteps.value  = []
  appointmentSlots.value = []
  activeSection.value   = 'overview'
}

/** Restore an existing Supabase session on page load (called from index.vue onMounted). */
async function restoreSession() {
  const session = await getSession()
  if (!session) return

  const profile = await fetchUserProfile(session.user.id)
  if (!profile || profile.role !== 'admin') return

  currentUserId.value   = session.user.id
  currentUserName.value = profile.full_name ?? currentUserName.value
  loggedIn.value        = true

  await Promise.all([
    loadAnnouncements(),
    loadChecklistSteps(),
    loadAppointmentSlots(),
  ])
}

// ─── Use case 2: Publish announcements ───────────────────────────────────────

async function loadAnnouncements() {
  announcements.value = await fetchAnnouncements()
}

function startEditAnnouncement(a: AnnouncementView) {
    editingAnnouncementId.value = a.id
    announcementDraft.value = {
      title: a.title,
      body: a.body,
      priority: a.priority
    }
    // Scroll the form into view smoothly
    document.querySelector('.clean-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

function cancelEditAnnouncement() {
  editingAnnouncementId.value = null
  announcementDraft.value = { title: '', body: '', priority: 'Standard' }
}

async function publishAnnouncement() {
    if (!currentUserId.value) return
    
    if (!announcementDraft.value.title.trim() || !announcementDraft.value.body.trim()) {
      showToast('Both the Announcement Title and Message Body are required.', 'error')
      return 
    }

    try {
      if (editingAnnouncementId.value) {
        await updateAnnouncementService(editingAnnouncementId.value, announcementDraft.value)
        showToast('Announcement updated successfully!', 'success')
      } else {
        await publishAnnouncementService(announcementDraft.value, currentUserId.value)
        showToast('Announcement published successfully!', 'success')
      }
      
      cancelEditAnnouncement()
      await loadAnnouncements() // Fetches updated DB with 5 item limit
    } catch (error: any) {
      showToast(error.message || 'Failed to save the announcement.', 'error')
    }
  }


  async function deleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await retractAnnouncement(id)
      showToast('Announcement removed.', 'success')
      if (editingAnnouncementId.value === id) cancelEditAnnouncement()
      await loadAnnouncements()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete announcement.', 'error')
    }
  }

  async function togglePin(announcementId: string, currentPinState: boolean) {
    try {
      await toggleAnnouncementPin(announcementId, currentPinState)
      await loadAnnouncements() // Reloads to instantly sort to the top
    } catch (error: any) {
      showToast(error.message || 'Failed to toggle pin.', 'error')
    }
  }

// ─── Use case 1: Configure the enrollment checklist ──────────────────────────

async function loadChecklistSteps() {
  checklistSteps.value = await fetchChecklistSteps() // Removed activeProgramId.value
  if (checklistSteps.value.length > 0 && !activeStepId.value) {
    activeStepId.value = checklistSteps.value[0]!.id
  }
}

/** Select a step to show in the right-hand detail panel. */
function activateStep(id: string) {
  activeStepId.value = id
}

/**
 * Admin clicks "+ Add step" on ChecklistPage.
 * Creates a new requirement with a default name and appends it to the list.
 * Admin can rename it inline afterwards (wire updateChecklistStep when you add that UI).
 */
async function addChecklistStep() {
  const nextOrder = checklistSteps.value.length + 1
  const newStep = await addStepService({
    name: `Step ${nextOrder}`,
    description: 'Describe this enrollment requirement.',
    stepOrder: nextOrder,
    is_mandatory:true,
  }) // Removed programId and isMandatory

  checklistSteps.value.push(newStep)
  activeStepId.value = newStep.id
}

/**
 * Admin removes a step from the checklist.
 * Soft-deletes in the DB; removes from local list immediately.
 */
async function removeChecklistStep(stepId: string) {
  await deleteChecklistStep(stepId)
  checklistSteps.value = checklistSteps.value.filter((s) => s.id !== stepId)
  if (activeStepId.value === stepId) {
    activeStepId.value = checklistSteps.value[0]?.id ?? null
  }
}

// ─── Use case 3: Appointment scheduling ──────────────────────────────────────

async function loadAppointmentSlots() {
  appointmentSlots.value = await fetchAppointmentSlots()
  if (appointmentSlots.value.length > 0 && !selectedSlotId.value) {
    selectedSlotId.value = appointmentSlots.value[0]!.id
  }
}

/**
 * Admin sets an appointment slot for a specific applicant.
 * Called from AppointmentsPage when the admin hits "Reserve Selected".
 *
 * @param applicationId   – the applicant's application UUID
 * @param appointmentType – type of visit (campus_visit, medical_exam, etc.)
 * @param scheduledDate   – the chosen datetime
 */
async function setAppointmentSlot(params: {
  applicationId: string
  appointmentType: AppointmentType
  scheduledDate: Date
}) {
  await createAppointmentSlot(params)
  // Refresh the headcount dashboard after creating the slot
  await loadAppointmentSlots()
}

/**
 * Admin cancels a slot (e.g. walk-in handled early, or reschedule needed).
 */
async function cancelSlot(appointmentId: string) {
  await cancelAppointmentSlot(appointmentId)
  await loadAppointmentSlots()
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function useEnrollStore() {
  return {
    // auth state
    loggedIn,
    loginForm,
    loginError,
    isLoading,
    currentUserId,
    currentUserName,

    // navigation
    activeSection,

    // use case 2 — announcements
    announcements,
    announcementDraft,
    editingAnnouncementId,

    // use case 1 — checklist
    checklistSteps,
    activeStepId,

    // use case 3 — appointments
    appointmentSlots,
    selectedSlotId,

    // computed
    totalSteps,
    completedSteps,
    completionRate,
    allStepsCompleted,
    activeSlot,
    studentTimeline,

    // Global Toast
    toastMsg,
    toastType,
    toastVisible,
    showToast,

    // auth actions
    signIn:         signInAction,
    signOut:        signOutAction,
    restoreSession,

    // use case 2
    publishAnnouncement,
    loadAnnouncements,
    togglePin,
    startEditAnnouncement,
    cancelEditAnnouncement,
    deleteAnnouncement,

    // use case 1
    addChecklistStep,
    removeChecklistStep,
    activateStep,
    loadChecklistSteps,

    // use case 3
    setAppointmentSlot,
    cancelSlot,
    loadAppointmentSlots,
  }
}
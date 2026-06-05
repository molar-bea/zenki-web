import { ref, computed } from 'vue'
import { signIn, signOut, getSession, fetchUserProfile } from '../services/Authservice'
import { fetchAnnouncements, publishAnnouncement as publishAnnouncementService, updateAnnouncement as updateAnnouncementService, toggleAnnouncementPin, retractAnnouncement } from '../services/Announcementservice'
import { fetchChecklistSteps, addChecklistStep as addStepService, deleteChecklistStep } from '../services/Checklistservice'
import { fetchSchedules, openScheduleDay, deleteScheduleDay,updateScheduleCapacity as updateCapacityService } from '../services/Appointmentservice'
import type {
  AnnouncementView,
  AnnouncementDraft,
  ChecklistStep,
  AppointmentScheduleView,
  AppointmentScheduleDraft
} from '../types/database.types'

// ─── Auth state ───
const loggedIn       = ref(false)
const currentUserId  = ref<string | null>(null)
const currentUserName = ref<string>('Admin')
const loginError     = ref<string | null>(null)
const isLoading      = ref(false)
const loginForm      = ref({ email: '', password: '' })
const activeSection  = ref<'overview' | 'checklist' | 'announcements' | 'appointments'>('overview')

// ─── Global UI State (Toast & Confirm Modal) ───
const toastMsg     = ref('')
const toastType    = ref<'success' | 'error'>('success')
const toastVisible = ref(false)

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value     = msg
  toastType.value    = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3500)
}

const confirmDialog = ref({
  isOpen: false,
  message: '',
  onConfirm: () => {}
})

function requestConfirm(message: string, onConfirm: () => void) {
  confirmDialog.value = {
    isOpen: true,
    message,
    onConfirm: () => {
      onConfirm()
      confirmDialog.value.isOpen = false
    }
  }
}

function cancelConfirm() {
  confirmDialog.value.isOpen = false
}

// ─── Announcements ───
const announcements = ref<AnnouncementView[]>([])
const announcementDraft = ref<AnnouncementDraft>({ title: '', body: '', priority: 'Standard' })
const editingAnnouncementId = ref<string | null>(null)

async function loadAnnouncements() { announcements.value = await fetchAnnouncements() }

function startEditAnnouncement(a: AnnouncementView) {
  editingAnnouncementId.value = a.id
  announcementDraft.value = { title: a.title, body: a.body, priority: a.priority }
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
    await loadAnnouncements()
  } catch (error: any) {
    showToast(error.message || 'Failed to save the announcement.', 'error')
  }
}

function deleteAnnouncement(id: string) {
  requestConfirm('Are you sure you want to delete this announcement?', async () => {
    try {
      await retractAnnouncement(id)
      showToast('Announcement removed.', 'success')
      if (editingAnnouncementId.value === id) cancelEditAnnouncement()
      await loadAnnouncements()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete announcement.', 'error')
    }
  })
}

async function togglePin(announcementId: string, currentPinState: boolean) {
  try {
    await toggleAnnouncementPin(announcementId, currentPinState)
    await loadAnnouncements()
  } catch (error: any) {
    showToast(error.message || 'Failed to toggle pin.', 'error')
  }
}

// ─── Checklist configuration ───
const checklistSteps = ref<ChecklistStep[]>([])
const activeStepId   = ref<string | null>(null)

const totalSteps = computed(() => checklistSteps.value.length)
const completedSteps = computed(() => checklistSteps.value.filter((s) => s.status === 'completed').length)
const completionRate = computed(() => totalSteps.value === 0 ? 0 : Math.round((completedSteps.value / totalSteps.value) * 100))
const allStepsCompleted = computed(() => totalSteps.value > 0 && completedSteps.value === totalSteps.value)

const studentTimeline = computed(() =>
  checklistSteps.value.map((s, i) => ({
    id: s.id, order: i + 1, title: s.title, status: s.status, active: s.id === activeStepId.value,
  }))
)

async function loadChecklistSteps() {
  checklistSteps.value = await fetchChecklistSteps()
  if (checklistSteps.value.length > 0 && !activeStepId.value) activeStepId.value = checklistSteps.value[0]!.id
}

function activateStep(id: string) { activeStepId.value = id }

async function addChecklistStep() {
  const nextOrder = checklistSteps.value.length + 1
  const newStep = await addStepService({
    name: `Step ${nextOrder}`, description: 'Describe this enrollment requirement.',
    stepOrder: nextOrder, is_mandatory: true,
  })
  checklistSteps.value.push(newStep)
  activeStepId.value = newStep.id
}

function removeChecklistStep(stepId: string) {
  requestConfirm('Delete this requirement? This cannot be undone.', async () => {
    await deleteChecklistStep(stepId)
    checklistSteps.value = checklistSteps.value.filter((s) => s.id !== stepId)
    if (activeStepId.value === stepId) activeStepId.value = checklistSteps.value[0]?.id ?? null
  })
}

// ─── Appointment Scheduling ───
const appointmentSchedules = ref<AppointmentScheduleView[]>([])
const scheduleDraft = ref<AppointmentScheduleDraft>({
  type: 'Medical Appointment',
  startDate: '',
  endDate: '',
  capacity: 30
})

async function loadAppointmentSchedules() {
  appointmentSchedules.value = await fetchSchedules()
}

async function openAppointmentDay() {
  if (!scheduleDraft.value.startDate || !scheduleDraft.value.endDate) {
    showToast('Please select both a start and end date.', 'error')
    return
  }
  if (new Date(scheduleDraft.value.startDate) > new Date(scheduleDraft.value.endDate)) {
    showToast('The end date must be after or equal to the start date.', 'error')
    return
  }
  if (scheduleDraft.value.capacity < 1) {
    showToast('Capacity must be at least 1.', 'error')
    return
  }

  try {
    await openScheduleDay(scheduleDraft.value)
    showToast(`${scheduleDraft.value.type} days opened successfully!`, 'success')
    
    // Reset form
    scheduleDraft.value.startDate = ''
    scheduleDraft.value.endDate = ''
    scheduleDraft.value.capacity = 30
    
    await loadAppointmentSchedules()
  } catch (error: any) {
    showToast(error.message || 'Failed to open schedule days.', 'error')
  }
}

function removeAppointmentDay(id: string) {
  requestConfirm('Are you sure you want to close this day? Students will no longer be able to book it.', async () => {
    try {
      await deleteScheduleDay(id)
      showToast('Schedule day closed.', 'success')
      await loadAppointmentSchedules()
    } catch (error: any) {
      showToast(error.message || 'Failed to close schedule day.', 'error')
    }
  })
}

async function updateScheduleCapacity(id: string, newCapacity: number) {
    if (newCapacity < 1) {
      showToast('Capacity must be at least 1.', 'error')
      return
    }
    try {
      await updateCapacityService(id, newCapacity)
      showToast('Daily capacity updated!', 'success')
      await loadAppointmentSchedules()
    } catch (error: any) {
      showToast(error.message || 'Failed to update capacity.', 'error')
    }
  }

// ─── Auth actions ───
async function signInAction() {
  loginError.value = null; isLoading.value  = true
  try {
    const session = await signIn(loginForm.value.email, loginForm.value.password)
    if (!session) throw new Error('Login failed — no session returned.')
    const profile = await fetchUserProfile(session.user.id)
    if (!profile || profile.role !== 'admin') {
      await signOut()
      throw new Error('Access denied: admin accounts only.')
    }
    currentUserId.value = session.user.id
    currentUserName.value = profile.full_name ?? currentUserName.value
    loggedIn.value = true
    loginForm.value = { email: '', password: '' }
    await Promise.all([loadAnnouncements(), loadChecklistSteps(), loadAppointmentSchedules()])
  } catch (err: unknown) {
    loginError.value = err instanceof Error ? err.message : 'Sign-in failed.'
  } finally {
    isLoading.value = false
  }
}

async function signOutAction() {
  await signOut()
  loggedIn.value = false; currentUserId.value = null
  announcements.value = []; checklistSteps.value = []; appointmentSchedules.value = []
  activeSection.value = 'overview'
}

async function restoreSession() {
  const session = await getSession()
  if (!session) return
  const profile = await fetchUserProfile(session.user.id)
  if (!profile || profile.role !== 'admin') return
  currentUserId.value = session.user.id
  currentUserName.value = profile.full_name ?? currentUserName.value
  loggedIn.value = true
  await Promise.all([loadAnnouncements(), loadChecklistSteps(), loadAppointmentSchedules()])
}

// ─── Export ───
export function useEnrollStore() {
  return {
    loggedIn, loginForm, loginError, isLoading, currentUserId, currentUserName, activeSection,
    announcements, announcementDraft, editingAnnouncementId,
    checklistSteps, activeStepId,
    appointmentSchedules, scheduleDraft,
    totalSteps, completedSteps, completionRate, allStepsCompleted, studentTimeline,
    toastMsg, toastType, toastVisible, showToast, confirmDialog, requestConfirm, cancelConfirm,
    signIn: signInAction, signOut: signOutAction, restoreSession,
    publishAnnouncement, loadAnnouncements, togglePin, startEditAnnouncement, cancelEditAnnouncement, deleteAnnouncement,
    addChecklistStep, removeChecklistStep, activateStep, loadChecklistSteps,
    loadAppointmentSchedules, openAppointmentDay, removeAppointmentDay,updateScheduleCapacity,
  }
}
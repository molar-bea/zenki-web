<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { createClient } from '@supabase/supabase-js'
import type { Requirement } from '../types/database.types'

// ─── Supabase client ──────────────────────────────────────────────────────────
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Types ────────────────────────────────────────────────────────────────────
interface RequirementRow {
  id: string
  user_id: string | null
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  is_mandatory: boolean
  is_deleted: boolean
  created_at: string
  step_order: number
}

// ─── State ────────────────────────────────────────────────────────────────────
const requirements  = ref<RequirementRow[]>([])
const isLoading     = ref(false)
const isSaving      = ref(false)
const isDeleting    = ref<string | null>(null)
const toastMsg      = ref('')
const toastType     = ref<'success' | 'error'>('success')
const toastVisible  = ref(false)
const editingId     = ref<string | null>(null)   // null = new, string = editing existing

// Form state
const form = ref({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  is_mandatory: true,
  step_order: 1,
})

// Sorting
const sortKey = ref<'step_order' | 'name' | 'start_date'>('step_order')

// ─── Computed ─────────────────────────────────────────────────────────────────
const sortedRequirements = computed(() => {
  return [...requirements.value].sort((a, b) => {
    if (sortKey.value === 'step_order') return a.step_order - b.step_order
    if (sortKey.value === 'name') return a.name.localeCompare(b.name)
    if (sortKey.value === 'start_date') {
      const da = a.start_date ?? ''
      const db = b.start_date ?? ''
      return da.localeCompare(db)
    }
    return 0
  })
})

const formTitle  = computed(() => editingId.value ? 'Edit Requirement' : 'Add Requirement')
const isEditing  = computed(() => editingId.value !== null)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value    = msg
  toastType.value   = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3500)
}

function padIndex(i: number) { return String(i).padStart(2, '0') }

function resetForm() {
  editingId.value = null
  form.value = { name: '', description: '', start_date: '', end_date: '', is_mandatory: true, step_order: requirements.value.length + 1 }
}

function startEdit(req: RequirementRow) {
  editingId.value      = req.id
  form.value.name        = req.name
  form.value.description = req.description ?? ''
  form.value.start_date  = req.start_date  ?? ''
  form.value.end_date    = req.end_date    ?? ''
  form.value.is_mandatory = req.is_mandatory
  form.value.step_order   = req.step_order
  // Scroll form into view on mobile
  document.querySelector('.form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── Supabase CRUD ────────────────────────────────────────────────────────────
async function fetchRequirements() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('requirement')
      .select('*')
      .eq('is_deleted', false)
      .order('step_order', { ascending: true })

    if (error) throw error
    requirements.value = data as RequirementRow[]
  } catch (err: any) {
    showToast(err.message ?? 'Failed to fetch requirements.', 'error')
  } finally {
    isLoading.value = false
  }
}

async function saveRequirement() {
  if (!form.value.name.trim()) {
    showToast('Requirement name is required.', 'error')
    return
  }

  isSaving.value = true
  try {
    if (isEditing.value) {
      // UPDATE existing
      const { error } = await supabase
        .from('requirement')
        .update({
          name:         form.value.name.trim(),
          description:  form.value.description.trim() || null,
          start_date:   form.value.start_date  || null,
          end_date:     form.value.end_date    || null,
          is_mandatory: form.value.is_mandatory,
          step_order:   form.value.step_order,
        })
        .eq('id', editingId.value!)

      if (error) throw error
      showToast('Requirement updated successfully.')
    } else {
      const { error } = await supabase
        .from('requirement')
        .insert({
          name:         form.value.name.trim(),
          description:  form.value.description.trim() || null,
          start_date:   form.value.start_date  || null,
          end_date:     form.value.end_date    || null,
          is_mandatory: form.value.is_mandatory,
          step_order:   form.value.step_order,
          is_deleted:   false,
          user_id:      null,
        })

      if (error) throw error
      showToast('Requirement added successfully.')
    }

    resetForm()
    await fetchRequirements()
  } catch (err: any) {
    showToast(err.message ?? 'Failed to save requirement.', 'error')
  } finally {
    isSaving.value = false
  }
}

async function deleteRequirement(id: string) {
  if (!confirm('Delete this requirement? This cannot be undone.')) return
  isDeleting.value = id
  try {
    const { error } = await supabase
      .from('requirement')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) throw error
    showToast('Requirement removed.')
    if (editingId.value === id) resetForm()
    await fetchRequirements()
  } catch (err: any) {
    showToast(err.message ?? 'Failed to delete requirement.', 'error')
  } finally {
    isDeleting.value = null
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchRequirements()
})

// Keep default step_order in sync with list length when resetting
watch(requirements, (list) => {
  if (!isEditing.value) form.value.step_order = list.length + 1
})
</script>

<template>
  <section class="checklist-view">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <p class="page-eyebrow">Admin · Enrollment Config</p>
        <h1 class="page-title">Checklist Configuration</h1>
      </div>
      <div class="header-meta">
        <span class="req-count">{{ requirements.length }} requirement{{ requirements.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toastVisible" :class="['toast', toastType === 'error' ? 'toast--error' : 'toast--success']">
        <span class="toast-icon">{{ toastType === 'error' ? '✕' : '✓' }}</span>
        {{ toastMsg }}
      </div>
    </Transition>

    <div class="workspace-grid">

      <!-- ── LEFT: Enrollment Sequence ───────────────────────────────────────── -->
      <article class="panel left-panel">
        <div class="panel__header">
          <div>
            <p class="panel-eyebrow">Enrollment Sequence</p>
            <h2 class="panel-title">Added Requirements</h2>
          </div>
          <div class="sort-control">
            <label class="sort-label" for="sort-sel">Sort</label>
            <select id="sort-sel" v-model="sortKey" class="sort-select">
              <option value="step_order">By order</option>
              <option value="name">By name</option>
              <option value="start_date">By date</option>
            </select>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="skeleton-list">
          <div v-for="n in 3" :key="n" class="skeleton-card"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="sortedRequirements.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-title">No added requirements on the list</p>
          <p class="empty-sub">Use the form on the right to add your first enrollment requirement.</p>
        </div>

        <!-- Requirements list -->
        <div v-else class="req-list">
          <div
            v-for="(req, index) in sortedRequirements"
            :key="req.id"
            class="req-card"
            :class="{ 'req-card--editing': editingId === req.id }"
          >
            <div class="req-card__index">
              <span>{{ padIndex(req.step_order) }}</span>
            </div>

            <div class="req-card__body">
              <div class="req-card__top">
                <strong class="req-name">{{ req.name }}</strong>
                <span :class="['mandatory-badge', req.is_mandatory ? 'mandatory-badge--yes' : 'mandatory-badge--no']">
                  {{ req.is_mandatory ? 'Mandatory' : 'Optional' }}
                </span>
              </div>

              <p v-if="req.description" class="req-desc">{{ req.description }}</p>

              <div class="req-dates">
                <div class="date-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span>Start: {{ formatDate(req.start_date) }}</span>
                </div>
                <div class="date-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span>End: {{ formatDate(req.end_date) }}</span>
                </div>
              </div>
            </div>

            <div class="req-card__actions">
              <button
                class="action-btn action-btn--edit"
                type="button"
                title="Edit requirement"
                @click="startEdit(req)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
              <button
                class="action-btn action-btn--delete"
                type="button"
                title="Delete requirement"
                :disabled="isDeleting === req.id"
                @click="deleteRequirement(req.id)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                {{ isDeleting === req.id ? '…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- ── RIGHT: Add / Edit Requirement Form ──────────────────────────────── -->
      <article class="panel form-panel">
        <div class="form-header">
          <div class="form-header__left">
            <div class="form-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/>
                <path v-if="!isEditing" d="M12 8v8M8 12h8"/>
                <path v-else d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              </svg>
            </div>
            <div>
              <p class="panel-eyebrow">Requirement Builder</p>
              <h2 class="panel-title">{{ formTitle }}</h2>
            </div>
          </div>
          <button
            v-if="isEditing"
            class="cancel-btn"
            type="button"
            @click="resetForm"
          >
            Cancel
          </button>
        </div>

        <div class="form-body">
          <!-- Name -->
          <div class="form-group">
            <label class="form-label" for="req-name">
              Requirement Name <span class="required-dot">*</span>
            </label>
            <input
              id="req-name"
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="e.g. Submit Transcript, Medical Certificate…"
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label" for="req-desc">Description</label>
            <textarea
              id="req-desc"
              v-model="form.description"
              class="form-input form-textarea"
              rows="3"
              placeholder="Provide additional context or instructions for students…"
            ></textarea>
          </div>

          <!-- Dates row -->
          <div class="form-dates-row">
            <div class="form-group">
              <label class="form-label" for="req-start">Start Date</label>
              <div class="date-input-wrap">
                <svg class="date-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <input
                  id="req-start"
                  v-model="form.start_date"
                  type="date"
                  class="form-input date-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="req-end">End Date</label>
              <div class="date-input-wrap">
                <svg class="date-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <input
                  id="req-end"
                  v-model="form.end_date"
                  type="date"
                  class="form-input date-input"
                />
              </div>
            </div>
          </div>

          <!-- Step order + Mandatory row -->
          <div class="form-dates-row">
            <div class="form-group">
              <label class="form-label" for="req-order">Step Order</label>
              <input
                id="req-order"
                v-model.number="form.step_order"
                type="number"
                class="form-input"
                min="1"
                placeholder="1"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Requirement Type</label>
              <div class="toggle-row">
                <button
                  type="button"
                  :class="['toggle-chip', form.is_mandatory ? 'toggle-chip--active' : '']"
                  @click="form.is_mandatory = true"
                >Mandatory</button>
                <button
                  type="button"
                  :class="['toggle-chip', !form.is_mandatory ? 'toggle-chip--active toggle-chip--optional' : '']"
                  @click="form.is_mandatory = false"
                >Optional</button>
              </div>
            </div>
          </div>

          <!-- Save button -->
          <button
            class="save-btn"
            type="button"
            :disabled="isSaving"
            @click="saveRequirement"
          >
            <svg v-if="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {{ isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Requirement' }}
          </button>
        </div>
      </article>

    </div>
  </section>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────────── */
.checklist-view {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 0 1rem 2rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.page-eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--clr-stone);
  font-weight: 600;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: var(--clr-ink);
  letter-spacing: -0.03em;
}

.header-meta { display: flex; align-items: center; gap: 0.75rem; }

.req-count {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--clr-stone);
  background: rgba(79,99,103,0.1);
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-pill);
}

/* ── Toast ──────────────────────────────────────────────────────────────────── */
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
  background: linear-gradient(135deg, rgba(122,158,159,0.22), rgba(184,216,216,0.95));
  color: var(--clr-ink);
  border: 1px solid rgba(122,158,159,0.35);
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

/* ── Grid ───────────────────────────────────────────────────────────────────── */
.workspace-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.5rem;
  align-items: start;
}

/* ── Panels ─────────────────────────────────────────────────────────────────── */
.panel {
  background: rgba(224,226,219,0.96);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.left-panel { padding: 1.5rem; }

.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.panel-eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(25,23,22,0.5);
  font-weight: 600;
}

.panel-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--clr-ink);
  letter-spacing: -0.02em;
}

/* ── Sort control ───────────────────────────────────────────────────────────── */
.sort-control { display: flex; align-items: center; gap: 0.5rem; }

.sort-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(25,23,22,0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sort-select {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--clr-stone);
  background: rgba(79,99,103,0.1);
  border: 1px solid rgba(79,99,103,0.18);
  border-radius: var(--radius-pill);
  padding: 0.35rem 0.7rem;
  outline: none;
  cursor: pointer;
}

/* ── Skeleton loader ────────────────────────────────────────────────────────── */
.skeleton-list { display: flex; flex-direction: column; gap: 0.85rem; }

.skeleton-card {
  height: 80px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, rgba(79,99,103,0.08) 25%, rgba(79,99,103,0.16) 50%, rgba(79,99,103,0.08) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty state ────────────────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1rem;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--clr-ink);
}

.empty-sub {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(25,23,22,0.55);
  line-height: 1.5;
  max-width: 22ch;
}

/* ── Requirement cards ──────────────────────────────────────────────────────── */
.req-list { display: flex; flex-direction: column; gap: 0.85rem; }

.req-card {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.62);
  border: 1px solid rgba(122,158,159,0.18);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.req-card:hover {
  border-color: rgba(122,158,159,0.45);
  box-shadow: var(--shadow-subtle);
}

.req-card--editing {
  border-color: var(--clr-slate);
  background: rgba(184,216,216,0.18);
  box-shadow: 0 0 0 2px rgba(122,158,159,0.25);
}

.req-card__index {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--clr-mist), var(--clr-slate));
  flex-shrink: 0;
}

.req-card__index span {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--clr-ink);
  font-family: var(--font-display);
}

.req-card__body { display: flex; flex-direction: column; gap: 0.45rem; min-width: 0; }

.req-card__top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.req-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--clr-ink);
  line-height: 1.3;
}

.mandatory-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}

.mandatory-badge--yes {
  background: rgba(79,99,103,0.15);
  color: var(--clr-stone);
}

.mandatory-badge--no {
  background: rgba(184,216,216,0.35);
  color: #456b6c;
}

.req-desc {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(25,23,22,0.65);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.req-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--clr-stone);
  font-weight: 600;
  background: rgba(79,99,103,0.08);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-pill);
}

/* ── Card action buttons ─────────────────────────────────────────────────────── */
.req-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.7rem;
  border-radius: var(--radius-pill);
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--transition), background var(--transition);
  white-space: nowrap;
}

.action-btn:hover { transform: translateY(-1px); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.action-btn--edit {
  background: linear-gradient(135deg, var(--clr-mist), var(--clr-slate));
  color: var(--clr-ink);
}

.action-btn--delete {
  background: rgba(79,99,103,0.1);
  color: #7a2020;
  border: 1px solid rgba(200,80,80,0.2);
}

.action-btn--delete:hover {
  background: rgba(200,80,80,0.12);
}

/* ── Form panel ─────────────────────────────────────────────────────────────── */
.form-panel {
  background: linear-gradient(160deg, #1f2c2e 0%, #192425 100%);
  padding: 0;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(184,216,216,0.1);
}

.form-header__left { display: flex; align-items: center; gap: 0.9rem; }

.form-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(184,216,216,0.12);
  color: var(--clr-mist);
  border: 1px solid rgba(184,216,216,0.18);
  flex-shrink: 0;
}

.form-panel .panel-eyebrow { color: rgba(224,226,219,0.45); }
.form-panel .panel-title   { color: var(--clr-fog); }

.cancel-btn {
  padding: 0.42rem 0.9rem;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(224,226,219,0.2);
  background: rgba(224,226,219,0.08);
  color: rgba(224,226,219,0.7);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.cancel-btn:hover {
  background: rgba(224,226,219,0.14);
  color: var(--clr-fog);
}

/* ── Form body ──────────────────────────────────────────────────────────────── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.45rem; }

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(224,226,219,0.7);
  letter-spacing: 0.04em;
}

.required-dot { color: #e87b7b; margin-left: 2px; }

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(184,216,216,0.16);
  background: rgba(255,255,255,0.05);
  color: var(--clr-fog);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  font-family: var(--font-body);
}

.form-input::placeholder { color: rgba(224,226,219,0.3); }

.form-input:focus {
  border-color: rgba(184,216,216,0.4);
  background: rgba(255,255,255,0.08);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.55;
}

/* Date input with icon */
.date-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.date-icon {
  position: absolute;
  left: 0.85rem;
  color: rgba(184,216,216,0.45);
  pointer-events: none;
  z-index: 1;
}

.date-input { padding-left: 2.2rem; }

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(0.6);
  cursor: pointer;
}

.form-dates-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Toggle chips */
.toggle-row { display: flex; gap: 0.5rem; }

.toggle-chip {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(184,216,216,0.16);
  background: rgba(255,255,255,0.05);
  color: rgba(224,226,219,0.6);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-chip:hover { background: rgba(255,255,255,0.09); color: var(--clr-fog); }

.toggle-chip--active {
  background: linear-gradient(135deg, var(--clr-mist), var(--clr-slate));
  color: var(--clr-ink);
  border-color: transparent;
}

.toggle-chip--optional.toggle-chip--active {
  background: rgba(184,216,216,0.2);
  color: var(--clr-mist);
  border-color: rgba(184,216,216,0.3);
}

/* ── Save button ────────────────────────────────────────────────────────────── */
.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.95rem 1.4rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: var(--radius-pill);
  background: linear-gradient(135deg, var(--clr-mist), var(--clr-slate));
  color: var(--clr-ink);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition), opacity var(--transition);
  box-shadow: 0 6px 20px rgba(122,158,159,0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(122,158,159,0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Spinner ────────────────────────────────────────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.9s linear infinite; }

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 1180px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .form-panel { order: -1; }
}

@media (max-width: 720px) {
  .page-title  { font-size: 1.6rem; }
  .form-dates-row { grid-template-columns: 1fr; }
  .req-card   { grid-template-columns: 40px 1fr; }
  .req-card__actions { flex-direction: row; grid-column: 1 / -1; }
}
</style>
<script setup lang="ts">
import type { AppointmentSlot } from '../types'

const props = defineProps(['appointmentSlots', 'selectedSlotId', 'activeSlot'])
const emit = defineEmits<{
  (e: 'select-slot', id: number): void
  (e: 'reserve-slot', id: number): void
}>()

function fillPct(slot: AppointmentSlot) {
  return (slot.booked / slot.capacity) * 100
}
</script>

<template>
  <section class="clean-view">
    <h1 class="page-title">Appointment Scheduling</h1>
    
    <div class="workspace-grid">
      <!-- Slots list -->
      <article class="clean-panel">
        <div class="panel__header">
          <h2>Reserve Campus Visits</h2>
          <button class="btn-flat" type="button" @click="emit('reserve-slot', selectedSlotId)">
            Reserve Selected
          </button>
        </div>
        <div class="slot-grid">
          <button
            v-for="slot in appointmentSlots"
            :key="slot.id"
            type="button"
            class="slot-card-clean"
            :class="{ 'slot-card-clean--active': slot.id === selectedSlotId }"
            @click="emit('select-slot', slot.id)"
          >
            <div class="slot-top">
              <strong>{{ slot.label }}</strong>
              <span class="slot-date">{{ slot.date }} | {{ slot.time }}</span>
            </div>
            <div class="slot-meta">
              <span>{{ slot.requirement }}</span>
              <strong>{{ slot.booked }}/{{ slot.capacity }}</strong>
            </div>
            <div class="slot-meter-clean">
              <div class="slot-meter-clean__fill" :style="{ width: `${fillPct(slot)}%` }"></div>
            </div>
          </button>
        </div>
      </article>

      <!-- Detail panel -->
      <article class="clean-panel">
        <h2>{{ activeSlot?.label }}</h2>
        <div class="detail-grid">
          <div class="detail-box">
            <span>Date</span>
            <strong>{{ activeSlot?.date }}</strong>
          </div>
          <div class="detail-box">
            <span>Time Window</span>
            <strong>{{ activeSlot?.time }}</strong>
          </div>
          <div class="detail-box">
            <span>Remaining Seats</span>
            <strong>{{ activeSlot ? activeSlot.capacity - activeSlot.booked : 0 }}</strong>
          </div>
        </div>
        <p class="detail-copy">
          Reserving a slot updates the daily headcount and keeps the enrollment floor from being overwhelmed by walk-ins.
        </p>
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
.workspace-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

.clean-panel { background: #ffffff; border: 1px solid #7A9E9F; border-radius: 12px; padding: 1.5rem; }
.panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel__header h2 { margin: 0; font-size: 1.2rem; color: #191716; }
.btn-flat { background: #4F6367; color: #E0E2DB; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; }

.slot-grid { display: flex; flex-direction: column; gap: 1rem; }
.slot-card-clean {
  text-align: left;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #E0E2DB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.slot-card-clean:hover { border-color: #7A9E9F; }
.slot-card-clean--active { 
  border-color: #4F6367; 
  background: rgba(184, 216, 216, 0.2); 
}
.slot-top strong { display: block; font-size: 1.05rem; color: #191716; }
.slot-date { font-size: 0.8rem; color: #4F6367; font-weight: 500; }
.slot-meta { display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.85rem; color: rgba(25, 23, 22, 0.7); }

.slot-meter-clean { height: 6px; background: #E0E2DB; border-radius: 4px; margin-top: 0.5rem; overflow: hidden; }
.slot-meter-clean__fill { height: 100%; background: #4F6367; }

.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem; }
.detail-box { background: #E0E2DB; padding: 1rem; border-radius: 8px; }
.detail-box span { display: block; font-size: 0.8rem; color: #4F6367; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.detail-box strong { color: #191716; font-size: 1.1rem; }
.detail-copy { margin-top: 2rem; line-height: 1.5; color: rgba(25, 23, 22, 0.8); }
</style>
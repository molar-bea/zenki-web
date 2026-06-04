<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue'

defineProps<{
  totalStudents: number | Ref<number> | ComputedRef<number>
  checkedInStudents: number | Ref<number> | ComputedRef<number>
  completionRate: number | Ref<number> | ComputedRef<number>
}>()
</script>

<template>
  <header class="hero-bar">
    <div>
      <p class="eyebrow eyebrow--light">Welcome back, Admin</p>
      <h1>Enrollment workflow dashboard</h1>
    </div>

    <div class="hero-stats">
      <div class="stat-chip">
        <span>Total students</span>
        <strong>{{ totalStudents }}</strong>
      </div>
      <div class="stat-chip">
        <span>Checked in today</span>
        <strong>{{ checkedInStudents }}</strong>
      </div>
      <div class="stat-chip">
        <span>Checklist completion</span>
        <strong>{{ completionRate }}%</strong>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem 0;
}

.hero-bar h1 {
  margin: 0;
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  font-size: clamp(1.8rem, 3vw, 3.2rem);
  color: var(--clr-fog);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-chip {
  min-width: 8.5rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(224,226,219,0.12);
  color: var(--clr-fog);
}

.stat-chip span {
  display: block;
  font-size: 0.75rem;
  color: rgba(224,226,219,0.75);
  letter-spacing: 0.04em;
}

.stat-chip strong {
  display: block;
  font-size: 1.35rem;
  margin-top: 0.2rem;
}

@media (max-width: 1180px) {
  .hero-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-stats {
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 720px) {
  .hero-stats { grid-template-columns: 1fr; }
}
</style>

<script setup lang="ts">
import type { Ref } from 'vue'
import enrollmateLogo from '../assets/enrollmateLogo.png'

defineProps<{
  activeSection: string | Ref<string>
}>()

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'sign-out'): void
}>()

const navItems = ['overview', 'checklist', 'announcements', 'appointments']
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <img :src="enrollmateLogo" alt="EnrollMate logo" />
      <div>
        <span>EnrollMate</span>
        <strong>Admin Console</strong>
      </div>
    </div>

    <nav class="nav-list" aria-label="Dashboard sections">
      <button
        v-for="item in navItems"
        :key="item"
        type="button"
        class="nav-item"
        :class="{ 'nav-item--active': activeSection === item }"
        @click="emit('navigate', item)"
      >
        <span class="nav-item__icon">
          <svg v-if="item === 'overview'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          
          <svg v-if="item === 'checklist'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>
          </svg>

          <svg v-if="item === 'announcements'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>

          <svg v-if="item === 'appointments'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.25V14"/><path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"/>
          </svg>
        </span>
        
        <span class="nav-item__label">{{ item }}</span>
      </button>
    </nav>

    <div class="sidebar__footer">
      <p>Signed in as Administrator1</p>
      <button class="btn-signout" type="button" @click="emit('sign-out')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -3px;">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  background-color: #4F6367;
  color: #E0E2DB;
  font-family: 'Inter', system-ui, sans-serif;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.sidebar__brand img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  background: #E0E2DB;
  border-radius: 8px;
  padding: 4px;
}

.sidebar__brand span {
  display: block;
  color: #B8D8D8;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.65rem;
  font-weight: 700;
}

.sidebar__brand strong {
  display: block;
  color: #E0E2DB;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #B8D8D8;
  text-align: left;
  text-transform: capitalize;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(184, 216, 216, 0.1);
  color: #E0E2DB;
}

.nav-item--active {
  background: #7A9E9F;
  color: #191716;
  font-weight: 700;
}

.nav-item--active .nav-item__icon {
  color: #191716;
}

.nav-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Size the SVGs */
.nav-item__icon svg {
  width: 20px;
  height: 20px;
}

.nav-item__label { 
  font-size: 0.95rem; 
}

.sidebar__footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(184, 216, 216, 0.2);
}

.sidebar__footer p {
  margin: 0 0 1rem;
  color: #B8D8D8;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-signout {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background: #191716;
  color: #E0E2DB;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-signout:hover {
  background: #000000;
}
</style>
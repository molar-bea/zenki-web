<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'
import enrollmateLogo from '../assets/enrollmateLogo.png'

const router = useRouter()
const adminEmail = ref('Loading...')

// Array of route objects to keep your v-for loop clean
const navItems = [
  { name: 'overview', path: '/dashboard' },
  { name: 'checklist', path: '/dashboard/checklist' },
  { name: 'announcements', path: '/dashboard/announcements' },
  { name: 'appointments', path: '/dashboard/appointments' }
]

// Fetch the logged-in user's email to display in the footer
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email) {
    adminEmail.value = user.email
  }
})

// Handle real Supabase sign-out
const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/') // Kick them back to the login page
}
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
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        active-class="nav-item--active"
        exact-active-class="nav-item--active"
      >
        <span class="nav-item__icon">
          <svg v-if="item.name === 'overview'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          
          <svg v-if="item.name === 'checklist'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>
          </svg>

          <svg v-if="item.name === 'announcements'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>

          <svg v-if="item.name === 'appointments'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.25V14"/><path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"/>
          </svg>
        </span>
        
        <span class="nav-item__label">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="sidebar__footer">
      <p class="user-email" :title="adminEmail">{{ adminEmail }}</p>
      
      <button class="btn-signout" type="button" @click="handleSignOut">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -3px;">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Keep all your existing styles exactly as they were! */
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

/* Because <router-link> renders as an <a> tag by default, 
we need to ensure text-decoration is removed */
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
  text-decoration: none; 
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

.sidebar__footer p.user-email {
  margin: 0 0 1rem;
  color: #B8D8D8;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Truncates long emails gracefully */
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
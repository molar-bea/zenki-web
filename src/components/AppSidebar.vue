<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'
import enrollmateLogo from '../assets/enrollmateLogo.png'

const router = useRouter()
const adminEmail = ref('Loading...')
const isMobileOpen = ref(false)
const showSignOutConfirm = ref(false)

const navItems = [
  { name: 'overview', path: '/dashboard' },
  { name: 'checklist', path: '/dashboard/checklist' },
  { name: 'announcements', path: '/dashboard/announcements' },
  { name: 'appointments', path: '/dashboard/appointments' }
]

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email) {
    adminEmail.value = user.email
  }
})

function closeMobileMenu() {
  isMobileOpen.value = false
}

function requestSignOut() {
  showSignOutConfirm.value = true
}

function cancelSignOut() {
  showSignOutConfirm.value = false
}

const handleSignOut = async () => {
  showSignOutConfirm.value = false
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
  <!-- Mobile top bar -->
  <div class="mobile-topbar">
    <div class="mobile-brand">
      <img :src="enrollmateLogo" alt="EnrollMate logo" />
      <div>
        <span>EnrollMate</span>
        <strong>Admin Console</strong>
      </div>
    </div>
    <button class="hamburger" @click="isMobileOpen = !isMobileOpen" :aria-expanded="isMobileOpen" aria-label="Toggle navigation">
      <svg v-if="!isMobileOpen" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isMobileOpen" class="sidebar-backdrop" @click="closeMobileMenu"></div>
  </Transition>

  <!-- Sign-out confirmation (toast-style) -->
  <Transition name="toast">
    <div v-if="showSignOutConfirm" class="signout-confirm">
      <div class="signout-confirm__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
      </div>
      <div class="signout-confirm__content">
        <p class="signout-confirm__title">Sign out?</p>
        <p class="signout-confirm__sub">You'll be returned to the login screen.</p>
      </div>
      <div class="signout-confirm__actions">
        <button class="confirm-btn confirm-btn--cancel" @click="cancelSignOut">Cancel</button>
        <button class="confirm-btn confirm-btn--yes" @click="handleSignOut">Sign out</button>
      </div>
    </div>
  </Transition>

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ 'sidebar--open': isMobileOpen }">
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
        @click="closeMobileMenu"
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
      <button class="btn-signout" type="button" @click="requestSignOut">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* ── Mobile top bar ──────────────────────────────────────────────────────────── */
.mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background-color: #4F6367;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mobile-brand img {
  width: 34px;
  height: 34px;
  object-fit: contain;
  background: #E0E2DB;
  border-radius: 7px;
  padding: 3px;
}

.mobile-brand span {
  display: block;
  color: #B8D8D8;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.6rem;
  font-weight: 700;
}

.mobile-brand strong {
  display: block;
  color: #E0E2DB;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hamburger {
  background: transparent;
  border: none;
  color: #E0E2DB;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  display: grid;
  place-items: center;
  transition: background 0.2s;
}

.hamburger:hover {
  background: rgba(224, 226, 219, 0.12);
}

/* ── Backdrop ────────────────────────────────────────────────────────────────── */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(25, 23, 22, 0.45);
  z-index: 299;
  backdrop-filter: blur(2px);
}

/* ── Sidebar ─────────────────────────────────────────────────────────────────── */
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
  text-overflow: ellipsis;
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
  gap: 0.45rem;
  font-family: inherit;
  font-size: 0.9rem;
}

.btn-signout:hover {
  background: #000000;
}

/* ── Sign-out confirmation (toast-style) ─────────────────────────────────────── */
.signout-confirm {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: #E0E2DB;
  border: 1px solid #B8D8D8;
  box-shadow: 0 8px 24px rgba(79, 99, 103, 0.2), 0 2px 8px rgba(0,0,0,0.08);
  min-width: 300px;
  max-width: calc(100vw - 3rem);
  font-family: 'Inter', system-ui, sans-serif;
}

.signout-confirm__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(79, 99, 103, 0.12);
  color: #4F6367;
  flex-shrink: 0;
}

.signout-confirm__content {
  flex: 1;
  min-width: 0;
}

.signout-confirm__title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #191716;
}

.signout-confirm__sub {
  margin: 0.1rem 0 0;
  font-size: 0.78rem;
  color: #7A9E9F;
  font-weight: 500;
}

.signout-confirm__actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.confirm-btn {
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
}

.confirm-btn--cancel {
  background: transparent;
  color: #4F6367;
  border: 1px solid #B8D8D8;
}

.confirm-btn--cancel:hover {
  background: #ffffff;
}

.confirm-btn--yes {
  background: #191716;
  color: #E0E2DB;
}

.confirm-btn--yes:hover {
  background: #000000;
}

/* ── Toast transition ────────────────────────────────────────────────────────── */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

/* ── Backdrop transition ─────────────────────────────────────────────────────── */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* ── Mobile layout ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .mobile-topbar {
    display: flex;
  }

  .sidebar-backdrop {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px;
    z-index: 300;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 20px rgba(0,0,0,0.2);
    overflow-y: auto;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .signout-confirm {
    top: auto;
    bottom: 1.25rem;
    right: 1rem;
    left: 1rem;
    min-width: unset;
  }
}
</style>
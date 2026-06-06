import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './utils/supabase'

import LoginPage from './pages/LoginPage.vue' 
import DashboardPage from './pages/index.vue' 
import OverviewPage from './pages/OverviewPage.vue' 
import ChecklistPage from './pages/ChecklistPage.vue'
import AnnouncementsPage from './pages/AnnouncementsPage.vue'
import AppointmentsPage from './pages/AppointmentsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'Login', 
      component: LoginPage 
    },
    { 
      path: '/dashboard', 
      name: 'Dashboard',
      component: DashboardPage, // The parent frame containing your sidebar
      meta: { requiresAuth: true }, // Applies authentication protection to this route and all its children
      children: [
        {
          path: '', // An empty path means this loads by default at "/dashboard"
          name: 'Overview',
          component: OverviewPage
        },
        {
          path: 'checklist', // Matches "/dashboard/checklist"
          name: 'Checklist',
          component: ChecklistPage
        },
        {
          path: 'announcements', // Matches "/dashboard/announcements"
          name: 'Announcements',
          component: AnnouncementsPage
        },
        {
          path: 'appointments', // Matches "/dashboard/appointments"
          name: 'Appointments',
          component: AppointmentsPage
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from) => {
  const { data: { session } } = await supabase.auth.getSession()

  // Keep authenticated users out of the login screen.
  if (to.name === 'Login' && session) {
    return { name: 'Overview' }
  }

  // checks matching metadata for the target route or any parent frames
  if (to.matched.some(record => record.meta.requiresAuth) && !session) {
    return { name: 'Login' }
  }
})

export default router
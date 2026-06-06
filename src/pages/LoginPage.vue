<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useEnrollStore } from '../composables/useEnrollStore'
import enrollmateLogo from '../assets/enrollmateLogo.png'

const store = reactive(useEnrollStore())
const router = useRouter()

async function handleLogin() {
  await store.signIn()
  if (store.loggedIn) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <main class="login-wrapper">
    <div class="login-box">
      <div class="brand">
        <img :src="enrollmateLogo" alt="EnrollMate logo" class="logo" />
        <h1>ENROLLMATE</h1>
      </div>
      <div class="description">
        <p class="eyebrow eyebrow--dark">Secure access</p>
        <h2>Administrator sign-in</h2>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <input v-model="store.loginForm.email" type="email" placeholder="Email" autocomplete="email" />
        <input v-model="store.loginForm.password" type="password" placeholder="Password" autocomplete="current-password" />
        
        <button type="submit" class="btn-signin" :disabled="store.isLoading">
          {{ store.isLoading ? 'Signing in...' : 'Sign in' }}
        </button>

        <p v-if="store.loginError" class="error-msg">{{ store.loginError }}</p>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 1.5rem;
}

.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 340px;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: min(280px, 80vw);
  height: auto;
  margin-bottom: 0.5rem;
}

.brand h1 {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  letter-spacing: 2px;
  margin: 0;
  color: var(--clr-ink);
}

.description {
  display: flex;
  flex-direction: column;
  align-items: start;
  font-family: 'Inter', sans-serif;
  font-size: 1.20rem;
  letter-spacing: 1px;
  margin: 0;
  color: var(--clr-ink);
  width: 100%;
}

.description h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 1.5rem;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: 0.5rem;
}

.login-form input {
  width: 100%;
  padding: 13px 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: #d9d9d9;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
  /* Prevent iOS zoom on focus */
  font-size: max(1rem, 16px);
}

.btn-signin {
  margin-top: 1rem;
  padding: 13px 32px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--clr-stone);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  font-size: 1rem;
  font-family: inherit;
}

.btn-signin:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-signin:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  color: #bf4343;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: center;
  font-weight: 500;
}

@media (max-width: 480px) {
  .login-wrapper {
    align-items: flex-start;
    padding-top: 3rem;
  }
}
</style>
<script setup lang="ts">
import enrollmateLogo from '../assets/enrollmateLogo.png'

const props = defineProps<{
  loginForm: { email: string; password: string }
}>()

const emit = defineEmits<{
  (e: 'sign-in'): void
}>()


</script>

<template>
  <main class="login-wrapper">
    <div class="login-box">
      <div class="brand">
        <img :src="enrollmateLogo" alt="EnrollMate logo" class="logo" />
        <h1>ENROLLMATE</h1>
      </div>
      <div class = description >
        <p class="eyebrow eyebrow--dark">Secure access</p>
        <h2>Administrator sign-in</h2>
      </div>
      
      
      <form class=" login-form" @submit.prevent="emit('sign-in')">
        <input v-model="loginForm.email" type="email" placeholder="Email" />
        <input v-model="loginForm.password" type="password" placeholder="Password" />
        <button type="submit" class="btn-signin">Sign in</button>
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
}

.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 350px;
  height: auto;
  margin-bottom: 0.5rem;
}

.brand h1 {
  font-family: 'Inter',sans-serif;
  font-size: 1.25rem;
  letter-spacing: 2px;
  margin: 0;
  color: var(--clr-ink);
}

.description {
  display: flex;
  flex-direction: column;
  align-items: start;
  font-family: 'Inter',sans-serif;
  font-size: 1.20rem;
  letter-spacing: 1px;
  margin: 0;
  color: var(--clr-ink);
}

.description h2{

  font-family: var(--font-display);
  font-size: 1.5rem;
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
}

.login-form input {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: none;
  background: #d9d9d9;
  font-size: 1rem;
  outline: none;
}

.btn-signin {
  margin-top: 1rem;
  padding: 10px 32px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--clr-stone);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-signin:hover {
  opacity: 0.9;
}


</style>

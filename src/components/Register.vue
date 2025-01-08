<template>
    <div class="register">
      <h1>Register</h1>
      <form @submit.prevent="handleRegister">
        <div>
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <router-link to="/login">Login here</router-link></p>
    </div>
  </template>
  
  <script setup>
  import axios from 'axios'
  import { ref } from 'vue'
  import router from '../router'
  
  const username = ref('')
  const password = ref('')
  
  const handleRegister = async () => {
    try {
      const response = await axios.post('/api/users', {
        username: username.value,
        password: password.value,
      })
  
      if (response.data) {
        router.push('/login') // Перенаправление на страницу логина
      }
    } catch (error) {
        console.log(error)
    }
  }
  </script>
  
  <style scoped>
  .register {
    max-width: 400px;
    margin: 0 auto;
  }
  </style>
  
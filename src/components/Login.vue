<template>
    <div class="login">
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <div>
                <label for="username">Username</label>
                <input type="text" id="username" v-model="username" required />
            </div>
            <div>
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
    </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import router from '../router';

const username = ref('')
const password = ref('')
    
const handleLogin = async () => {
    try {
        const response = await axios.post('/api/login', {
            username: username.value, // Используем username.value вместо this.username
            password: password.value, // Используем password.value вместо this.password
        }, { withCredentials: true });

        if (response.data.success) {
            alert('Login successful!');
            router.push('/'); // Перенаправление на главную страницу
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error('Login failed:', error.response?.data?.message || error.message);
    }
}
</script>

<style scoped>
.login {
    max-width: 400px;
    margin: 0 auto;
}
</style>
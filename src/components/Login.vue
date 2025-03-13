<template>
    <div class="login">
        <form class="login-form" @submit.prevent="handleLogin">
            <div class="login-container">
                <div class="login-smile-container">
                    <img src="../assets/login-smile.svg" alt="smile" class="login-smile-img">
                </div>
                <h2 class="login-title">Вход</h2>
                <div>
                    <label class="login-name" for="username">Логин</label>
                    <input class="login-input" type="text" id="username" v-model="username" required placeholder="Логин"/>
                </div>
                <div>
                    <label class="login-password" for="password">Пароль</label>
                    <input class="login-input" type="password" id="password" v-model="password" required placeholder="Пароль"/>
                </div>
            </div>
            
            <button class="login-button" type="submit">
                <div class="login-button__content">
                    <img src="../assets/login.svg" alt="login" class="login-button__img">
                    <span>Войти</span>
                </div>
            </button>
            <router-link class="login-register-button" to="/register">
                <div class="login-register-button__content">
                    <img src="../assets/registration.svg" alt="login" class="login-register-button__img">
                    <span>Зарегистрироваться</span>
                </div>
            </router-link>
        </form>
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
.login-form {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.login-title {
    font-size: 23px;
    color: #FFF;
    margin-top: 0;
    margin-bottom: 0;
}
.login-container {
    margin-top: 2px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    background-color: #2E2E31;
    width: calc(100% - 34px);
    margin: 231px auto 0 auto;
    border-radius: 21px;
    padding-top: 57px;
    padding-bottom: 13px;
    position: relative;
}
.login-container > div {
    margin-top: 19px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: calc(100% - 26px);
} 
.login-name {
    color: #fff;
    font-size: 17px;
    width: 100%;
    text-align: left;
    margin-bottom: 8px;
}
.login-password {
    color: #fff;
    font-size: 17px;
    width: 100%;
    text-align: left;
    margin-bottom: 8px;
}
.login-input {
    border: none;
    height: 52px;
    width: 100%;
    border-radius: 13px;
    padding-left: 19.57px;
    font-size: 13px;
    background-color: #414147;
    outline: none;
}
.login-input::placeholder {
    color: #868686;
}
.login-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 34px);
    background-color: #248FE7;
    border-radius: 13px;
    height: 52px;
    margin-top: 13px;
}
.login-button__content {
    width: 77px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
}
.login-register-button {
    display: flex;
    justify-content: center;
    width: calc(100% - 34px);
    background-color: #248FE7;
    border-radius: 13px;
    height: 52px;
    margin-top: 6px;
}
.login-register-button__content {
    width: 201px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
}
.login-button__img {
    width: 12px;
    height: 12px;
}
.login-register-button__img {
    width: 13px;
    height: 13px;
}
.login-smile-container {
    box-sizing: border-box;
    width: 209px!important;
    height: 209px;
    display: flex;
    justify-content: center!important;
    align-items: center;
    border: 20px solid #0A0A0A;
    border-radius: 140px;
    background-color: #248FE7;
    position: absolute;
    top: 0px;
    transform: translateY(-50%);
    margin-top: 0!important;
}
.login-smile-img {
    width: 93.72px;
    height: 93.72px;
}
@media screen and (max-width: 767px) {
    .login-smile-container {
        border: 9px solid #0A0A0A;
        width: 90px!important;
        height: 90px;
        margin-top: 0!important;
    }
    .word-smile-img {
        width: 33px;
        height: 33px;
    }
}
</style>
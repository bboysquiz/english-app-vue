<template>
  <div class="register">
    <form class="register-form" @submit.prevent="handleRegister">
      <div class="register-input-container">
        <div class="register-smile-container">
          <img src="../assets/login-smile.svg" alt="smile" class="word-smile-img">
        </div>
        <h2 class="register-title">Регистрация</h2>
        <div>
          <label class="register-input-label" for="username">Логин</label>
          <input class="register-input" type="text" id="username" v-model="username" required placeholder="Логин" />
        </div>
        <div>
          <label class="register-input-label" for="phoneNumber">Телефон</label>
          <input class="register-input" type="text" id="phoneNumber" v-model="phoneNumber" required
            placeholder="+79000000000" />
        </div>
        <div>
          <label class="register-input-label" for="mail">Электронная почта</label>
          <input class="register-input" type="text" id="mail" v-model="mail" required placeholder="email@mail.ru" />
        </div>
        <div>
          <label class="register-input-label" for="password">Пароль</label>
          <input class="register-input" type="password" id="password" v-model="password" required
            placeholder="Пароль" />
          <input class="register-input" type="password" id="passwordSecond" v-model="passwordSecond" required
            placeholder="Повторите пароль" />
        </div>
      </div>
      <button class="register-button" type="submit">
        <div class="register-button__content">
          <img src="../assets/registration.svg" alt="register" class="register-button__img">
          <span>Зарегистрироваться</span>
        </div>
      </button>
      <router-link class="register-login-button" to="/login">
        <div class="register-login-button__content">
          <img src="../assets/login.svg" alt="login" class="register-login-button__img">
          <span>Страница логина</span>
        </div>
      </router-link>
    </form>
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
.register-form {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.register-input-container {
  margin-top: 2px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  background-color: #2E2E31;
  width: calc(100% - 34px);
  margin: 80px auto 0 auto;
  border-radius: 21px;
  padding-top: 57px;
  padding-bottom: 13px;
  position: relative;
}

.register-input-container>div {
  margin-top: 19px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: calc(100% - 26px);
}

.register-smile-container {
  box-sizing: border-box;
  width: 209px !important;
  height: 209px;
  display: flex;
  justify-content: center !important;
  align-items: center;
  border: 20px solid #0A0A0A;
  border-radius: 140px;
  background-color: #248FE7;
  position: absolute;
  top: 0px;
  transform: translateY(-50%);
  margin-top: 0 !important;
}

.register-smile-img {
  width: 93.72px;
  height: 93.72px;
}

.register-title {
  font-size: 23px;
  color: #FFF;
  margin-top: 0;
  margin-bottom: 0;
  width: 100%;
}

.register-input-label {
  color: #fff;
  font-size: 17px;
  width: 100%;
  text-align: left;
  margin-bottom: 8px;
}

.register-input {
  border: none;
  height: 52px;
  width: 100%;
  border-radius: 13px;
  padding-left: 19.57px;
  font-size: 13px;
  background-color: #414147;
  outline: none;
  margin-top: 5px;
}

.register-input::placeholder {
  color: #868686;
}

.register-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% - 34px);
  background-color: #248FE7;
  border-radius: 13px;
  height: 52px;
  margin-top: 13px;
  color: #fff;
}

.register-button__content {
  width: 182px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.register-login-button {
  display: flex;
  justify-content: center;
  width: calc(100% - 34px);
  background-color: #248FE7;
  border-radius: 13px;
  height: 52px;
  margin-top: 6px;
}

.register-login-button__content {
  width: 159px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.register-button__img {
  width: 12px;
  height: 12px;
}

.register-login-button__img {
  width: 13px;
  height: 13px;
}

@media screen and (max-width: 767px) {
  .register-smile-container {
    border: 9px solid #0A0A0A;
    width: 90px !important;
    height: 90px;
    margin-top: 0 !important;
  }

  .register-smile-img {
    width: 33px;
    height: 33px;
  }
}
</style>
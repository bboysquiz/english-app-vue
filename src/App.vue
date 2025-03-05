<template>
  <div class="main">
    <header class="header">
      <button v-if="router.currentRoute.value.fullPath !== '/login' && router.currentRoute.value.fullPath !== '/register'" class="logout-button" @click="logout">
        <img src="./assets/logout.svg" alt="logout" class="logout-img">
      </button>
    </header>
    <router-view></router-view>
    <footer class="footer" v-if="router.currentRoute.value.fullPath !== '/login' && router.currentRoute.value.fullPath !== '/register'">
      <router-link class="link" :to="{ name: 'main' }">
        <img src="./assets/home.svg" alt="home" class="footer-img footer-img-home">
        <div class="footer-link-title">Учить</div>
      </router-link>
      <router-link class="link" :to="{ name: 'dictionary' }">
        <img src="./assets/dictionary.svg" alt="dictionary" class="footer-img footer-img-dictionary">
        <div class="footer-link-title">Словарь</div>
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import router from './router';
import axios from 'axios';

const logout = async () => {
  try {
    await axios.post('/api/logout', {}, { withCredentials: true });

    // Очистка локальных данных
    localStorage.removeItem('refreshToken');

    // Перенаправление на страницу входа
    router.push('/login');
  } catch (error) {
    console.error('Ошибка при выходе:', error.response?.data?.message || error.message);
  }
};
</script>

<style scoped>
.main {
  background-color: #0A0A0A;
  overflow-y: hidden;
  height: 100vh;
  width: 100vw;
  background-size: cover;
}

.footer {
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 8.42vh;
}

@media screen and (max-width: 767px) {
  .footer {
    background-color: #2e2e31;
    align-items: center;
    height: 66px;
  }
}

.footer-img {
  width: 6vh;
}
.link {
  filter: brightness(0) invert(1);
}
.link.router-link-active {
  filter: none;
}


.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.logout-button {
  width: 102px;
  height: 102px;
  border-radius: 65px;
  background-color: #56565E;
  position: absolute;
  top: 8.67vh;
  right: 40px;
  z-index: 1;
}
@media screen and (max-width: 767px) {
  .logout-button {
    width: 40px;
    height: 40px;
    top: 70px;
  }
}
.logout-img {
  width: 36px;
  height: 36px;
  color: #fff;
}
@media screen and (max-width: 767px) {
  .logout-img {
    width: 14.12px;
    height: 12.12px;
  }
}
.footer-img-home {
  width: 6.64vw;
  height: 2.23vh;
}
.footer-img-dictionary {
  width: 3.86vw;
  height: 2.23vh;
}
.footer-link-title {
  color: #868686;
  font-size: 20px;
}
.link.router-link-active > .footer-link-title{
  color: #fff;
}
</style>



<template>
  <div class="main">
     
      
  
      <router-view></router-view>
      <footer class="footer">
        <router-link class="link" :to="{ name: 'main' }">
          <img src="./assets/home.svg" alt="home" class="footer-img">
        </router-link>
        <router-link class="link" :to="{ name: 'dictionary' }">
          <img src="./assets/dictionary.svg" alt="dictionary" class="footer-img">
        </router-link>
      </footer>
  </div>
</template>

<script setup>

</script>

<style scoped>
.main {
  background: url(../src/assets/bg.jpg) center no-repeat;
  height: 100vh;
  overflow-y: hidden;
}
.footer {
  margin-top: 7vh;
  display: flex;
  justify-content: space-around;
}
.footer-img {
  width: 6vh;
  height: 6vh;
}
.link.router-link-active {
  border-bottom: 2px solid #FFFFFF;
  filter: brightness(0) invert(1);
}

</style>

import { createRouter, createWebHistory } from 'vue-router'
import Main from '../components/Main.vue'
import Dictionary from '../components/Dictionary.vue'
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Main, name: 'main'},
        { path: '/Dictionary', component: Dictionary, name: 'dictionary' },
        { path: '/login', component: Login, name: 'login' },
        { path: '/register', component: Register, name: 'register' },
    ]
})

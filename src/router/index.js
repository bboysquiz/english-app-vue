import { createRouter, createWebHistory } from 'vue-router'
import Main from '../components/Main.vue'
import Dictionary from '../components/Dictionary.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Main, name: 'main'},
        { path: '/Dictionary', component: Dictionary, name: 'dictionary' },
    ]
})
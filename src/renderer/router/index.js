import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'


const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../src/Views/home.vue')
    },
	]
})

export default router

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ByClassView from './views/ByClassView.vue'
import CompareView from './views/CompareView.vue'
import { useUnitDataStore } from './stores/unitData.js'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { isListView: true }
    },
    {
      path: '/by-class',
      name: 'by-class',
      component: ByClassView,
      meta: { isListView: true }
    },
    {
      path: '/:ids',
      name: 'compare',
      component: CompareView,
      props: route => ({ ids: route.params.ids }),
      beforeEnter: (to, from, next) => {
        const ids = to.params.ids
        if (ids && typeof ids === 'string' && ids.match(/^[a-zA-Z0-9,_-]+$/)) {
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.afterEach(() => {
  if (window.location.hash && !window.location.hash.startsWith('#/')) {
    const newHash = '#/' + window.location.hash.substring(1)
    window.history.replaceState(null, '', newHash)
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const unitStore = useUnitDataStore()

router.beforeEach((to, from, next) => {
  if (to.meta.isListView) {
    unitStore.lastListViewRoute = to.path
  }
  next()
})

unitStore.loadData().catch(error => {
  console.error('Failed to load unit data:', error)
})

router.isReady().then(() => {
  const savedView = localStorage.getItem('faf-last-view')
  if (savedView && router.currentRoute.value.path === '/' && savedView !== '/') {
    router.replace(savedView)
  }
})

app.mount('#app')

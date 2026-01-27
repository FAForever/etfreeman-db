import { createRouter, createWebHashHistory } from 'vue-router'
import { useUnitDataStore } from '../stores/unitData.js'
import HomeView from '../views/HomeView.vue'
import ByClassView from '../views/ByClassView.vue'
import CompareView from '../views/CompareView.vue'

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

router.beforeEach((to, from, next) => {
  if (to.meta.isListView) {
    const unitStore = useUnitDataStore()
    unitStore.lastListViewRoute = to.path
  }
  next()
})

router.isReady().then(() => {
  const savedView = localStorage.getItem('faf-last-view')
  if (savedView && router.currentRoute.value.path === '/' && savedView !== '/') {
    router.replace(savedView)
  }
})

export default router

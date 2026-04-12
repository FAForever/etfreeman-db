import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ByTypeView from '../views/ByTypeView.vue'
import CompareView from '../views/CompareView.vue'

const PREFERRED_VIEW_KEY = 'preferred-view'
export const getPreferredView = () => localStorage.getItem(PREFERRED_VIEW_KEY) || '/'
export const setPreferredView = (path) => localStorage.setItem(PREFERRED_VIEW_KEY, path)

let initialPreferredView = getPreferredView()

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: HomeView,
      beforeEnter: () => setPreferredView('/')
    },
    {
      path: '/by-type',
      component: ByTypeView,
      beforeEnter: () => setPreferredView('/by-type')
    },
    {
      path: '/:ids',
      name: 'compare',
      component: CompareView,
      props: route => ({ ids: route.params.ids }),
      beforeEnter: (to) => /^[a-zA-Z0-9,_-]+$/.test(to.params.ids) || '/'
    }
  ]
})

router.isReady().then(() => {
  if (router.currentRoute.value.name === 'compare') return
  if (initialPreferredView !== '/') router.push(initialPreferredView)
})

export const toPreferredView = () => router.push(getPreferredView())
export default router

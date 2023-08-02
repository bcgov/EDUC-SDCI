import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {useAppStore} from "../stores/app"
//import SchoolSearchView from '../views/SchoolSearchView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', //landing page
      name: 'home',
      component: HomeView
    },
    {
      path: '/list-districts',
      name: 'list districts',
      component: () =>  import('../views/ListDistricts.vue')
    },
    {
      path: '/list-schools',
      name: 'list schools',
      component: () =>  import('../views/ListSchools.vue')
    },    
    {    
      path: '/search',
      name: 'search',
      component: () =>  import('../views/SchoolSearchView.vue'
      )
    },
    {
      path: '/school', //TODO: Add mincode once we setup axios call to get school data
      name: 'school',
      component: () =>  import('../views/SchoolView.vue'
      )
    },
    {
      path: '/district/:districtNumber-:displayName',
      name: 'district',
      component: ()=> import('../views/DistrictView.vue'),
      beforeEnter: async (to, from, next) => {
        const appStore = useAppStore()
        await appStore.setDistricts();
        console.log("LOADED DISTRICTS")
        next();
      },      
    },
    {
      path: '/authority', //TODO: Add auth code once we setup axios call to get dist data
      name: 'authority',
      component: () =>  import('../views/AuthorityView.vue'
      )
    },
    {
      path: '/offshore',
      name: 'offshore',
      component: () => import('../views/OffshoreView.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router

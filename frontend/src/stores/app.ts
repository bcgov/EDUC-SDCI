import { storeToRefs, defineStore } from 'pinia';

interface District {
  districtId: string;
  displayName: string;
  districtNumber: string
}

interface Authority {
  independentAuthorityId: string;
  displayName: string;
  authorityNumber: string;
  closedDate: string;
}

interface School {
  id: number;
  name: string;
  mincode: string;

}

import InstituteService from '../services/InstituteService'

export const useAppStore = defineStore('app', {
  state: () => ({
    districts: [] as District[],
    authorities: [] as Authority[],
    schools: [] as School[]
  }),
  actions: {
    setDistricts(): void {
     
        InstituteService.getDistricts()
          .then((response) => {
            // Handle the response data
            this.districts = response.data
          })
          .catch((error) => {
            // Handle the error
            console.error(error)
          })
    },
    setAuthorities(): void {
      InstituteService.getAuthorities().then((response) => {
        //handle the response
        this.authorities = response.data
      })
      .catch((error) => {
        //handle the error
        console.error(error)
      })
    },
    setSchoolList(): void {

      InstituteService.getSchoolList()
      .then((response) => {
        // Handle the response data
        this.schools = response.data
      })
      .catch((error) => {
        // Handle the error
        console.error(error)
      })
      
    }
  },
  getters: {
    getDistricts: (state) => {
      return state.districts
    },
    getDistrictList: (state) => {
      return state.districts.map((district) => {return {districtNumber: district.districtNumber, displayName: district.displayName}})
    },
    getDistrictByDistrictNumber: (state) => {
      return (distNum: string | String) => state.districts.find((district) => distNum === district.districtNumber)
    },
    getAuthorities: (state) => {
      return state.authorities
    },
    getAuthoritiesList: (state) => {
      return state.authorities.map((authority) => {return {authorityNumber: authority.authorityNumber, displayName: authority.displayName}})
    },
    getAuthorityByAuthorityNumber: (state) => {
      return (authNum: string | String) => state.authorities.find((authority) => authNum === authority.authorityNumber)
    },
    getSchools: (state) => {
      return () => state.schools
    }
  }
});
import { storeToRefs, defineStore } from 'pinia';

interface District {
  districtId: string;
  displayName: string;
  districtNumber: string
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
      return () => state.districts
    },
    getDistrictList: (state) => {
      return state.districts.map((district) => {return {districtNumber: district.districtNumber, displayName: district.displayName}})
    },
    getDistrictByDistrictNumber: (state) => {
      return (distNum: String) => state.districts.find((district) => distNum === district.districtNumber)
    },
    getSchools: (state) => {
      return () => state.schools
    }
  }
});
import { defineStore } from 'pinia';

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
    setSchools(schools: School[]): void {

      this.schools = schools;
    }
  },
  getters: {
    getDistricts(): District[] {
      return this.districts;
    },
    getSchools(): School[] {
      return this.schools;
    }
  }
});
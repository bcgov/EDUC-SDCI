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

export const useAppStore = defineStore('app', {
  state: () => ({
    districts: [] as District[],
    schools: [] as School[]
  }),
  actions: {
    setDistricts(districts: District[]): void {
      this.districts = districts;
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
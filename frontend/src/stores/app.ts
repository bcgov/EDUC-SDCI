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
    convertToCSV(jsonArray) {
      let csvContent = "";

      if (jsonArray.length === 0) {
        return csvContent;
      }

      // Extract headers
      const headers = Object.keys(jsonArray[0]);
      csvContent += headers.join(",") + "\n";

      // Extract values
      jsonArray.forEach((item) => {
        const values = headers.map((header) => {
          const value = item[header];
          return typeof value === "string" ? `"${value}"` : value;
        });
        csvContent += values.join(",") + "\n";
      });
      console.log(csvContent);
      return csvContent;
    },
    exportToCSV(csvData) {
      // Create a blob with the CSV data
      const blob = new Blob([csvData], { type: 'text/csv' });

      // Create a temporary anchor element to trigger the file download
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'output.csv';
      a.click();
    },
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

    },

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
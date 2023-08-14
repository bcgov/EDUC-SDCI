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
  closedDate?: string;
}

interface School {
  id: number;
  name: string;
  mincode: string;

}

interface DistrictContactTypeCode {
  districtContactTypeCode: string;
  label: string;
  description?: string;
}

interface CategoryCode {
  schoolCategoryCode: string,
  label: string;
  description: string;
}

interface ContactTypeCode {
  authorityContactTypeCodes: [],
  districtContactTypeCodes: [];
  schoolContactTypeCodes: [];
}

import InstituteService from '../services/InstituteService'

export const useAppStore = defineStore('app', {
  state: () => ({
    districts: [] as District[],
    authorities: [] as Authority[],
    schools: [] as School[],
    districtContactTypeCodes: [] as DistrictContactTypeCode[],
    categoryCodes: [] as CategoryCode[],
    contactTypeCodes: [] as ContactTypeCode[],
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

    },
    setCodes(): void {
      // set district contact type codes
      InstituteService.getDistrictContactTypeCodes().then((response) => {
        this.districtContactTypeCodes = response.data
      })
      .catch((error) => {
        console.error(error)
      })

      // set category codes
      InstituteService.getCategoryCodes().then((response) => {
        this.categoryCodes = response.data
      }).catch((error) => {
        console.error(error)
      })
      
      InstituteService.getContactTypeCodes().then((response) => {
        this.contactTypeCodes = response.data
      }).catch((error) => {
        console.error(error)
      })      
    }

  },
  getters: {
    // Districts
    getDistricts: (state) => {
      return state.districts
    },
    getDistrictList: (state) => {
      return state.districts.map((district) => {return {districtNumber: district.districtNumber, displayName: district.displayName}})
    },
    getDistrictByDistrictNumber: (state) => {
      return (distNum: string | String) => state.districts.find((district) => distNum === district.districtNumber)
    },
    // Independent Authorities
    getAuthorities: (state) => {
      return state.authorities
    },
    getAuthoritiesList: (state) => {
      return state.authorities.map((authority) => {return {authorityNumber: authority.authorityNumber, displayName: authority.displayName}})
    },
    getAuthorityByAuthorityNumber: (state) => {
      return (authNum: string | String) => state.authorities.find((authority) => authNum === authority.authorityNumber)
    },
    // Schools
    getSchools: (state) => {
      return () => state.schools
    },
    // Codes
    getContactTypeCodes: (state) => {
      return state.contactTypeCodes
    },
    getDistrictContactTypeCodes: (state) => {
      return state.districtContactTypeCodes
    },
    getDistrictContactTypeCodesLabel: (state) => {
      return (searchCode: string | String) => state.districtContactTypeCodes.find((contactCode) => searchCode === contactCode.districtContactTypeCode)?.label
    },
    getAllDistrictContactTypeCodesLabel: (state) => {
      return state.districtContactTypeCodes.map(item => item.label)
    },
    getCategoryCodes: (state) => {
      return state.categoryCodes
    },
    getCategoryCodesLabel: (state) => {
      return (searchCode: string | String ) => state.categoryCodes.find((categoryCode) => searchCode === categoryCode.schoolCategoryCode)?.label
    }
  }
});
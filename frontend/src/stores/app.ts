import { storeToRefs, defineStore } from 'pinia';
import * as jsonexport from "jsonexport/dist"
// import type definitions
import type {ListDistrict, ListAuthority, ListSchool, CategoryCode, FacilityCode, AddressTypeCode, ContactTypeCode, GradeCode, Grade} from '@/types/types'

import InstituteService from '@/services/InstituteService'

export const useAppStore = defineStore('app', {
  state: () => ({
    districts: [] as ListDistrict[],
    authorities: [] as ListAuthority[],
    schools: [] as ListSchool[],
    offshoreSchools: [] as ListSchool[],
    categoryCodes: [] as CategoryCode[],
    facilityCodes: [] as FacilityCode[],
    addressTypeCodes: [] as AddressTypeCode[],
    contactTypeCodes: {} as ContactTypeCode,
    gradeCodes: [] as Grade[]
  }),
  actions: {
    convertToCSV(jsonArray: any) {
      let csvContent = "";
      if (jsonArray.length === 0) {
        return csvContent;
      }
      // Extract headers
      const headers = Object.keys(jsonArray[0]);
      csvContent += headers.join(",") + "\n";
      // Extract values
      jsonArray.forEach((item: any) => {
        const values = headers.map((header) => {
          const value = item[header];
          return typeof value === "string" ? `"${value}"` : value;
        });
        csvContent += values.join(",") + "\n";
      });
      return csvContent;
    },
    exportCSV(csvData: any) {
        // Create a blob with the CSV data
        const blob = new Blob([csvData], { type: 'text/csv' });
        // Create a temporary anchor element to trigger the file download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'output.csv';
        a.click();
    },
    compareSchoolGrades(schoolGradesCode: Grade[], schoolGrades: Grade[]): Grade[] {
      return schoolGradesCode.filter(sg1 => schoolGrades.some(sg2 => sg1.schoolGradeCode === sg2.schoolGradeCode));
    },
    extractGradeLabels(schoolGrades: Grade[]){
      const gradeLabels: (string | undefined)[] = schoolGrades.map(grade => grade.label)
      return gradeLabels
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
    setAuthorityList(): void {
      InstituteService.getAuthorityList().then((response) => {
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
    setOffshoreSchoolList(): void {

      InstituteService.getOffshoreSchoolList()
      .then((response) => {
        // Handle the response data
        this.offshoreSchools = response.data
      })
      .catch((error) => {
        // Handle the error
        console.error(error)
      })

    },
    setCodes(): void {
      // set category codes
      InstituteService.getCategoryCodes().then((response) => {
        this.categoryCodes = response.data
      }).catch((error) => {
        console.error(error)
      })

      // set facility type codes
      InstituteService.getFacilityCodes().then((response) => {
        this.facilityCodes = response.data
      }).catch((error) => {
        console.error(error)
      })

      // set contact type codes for Districts, Authorities, and Schools
      InstituteService.getContactTypeCodes().then((response) => {
        this.contactTypeCodes = response.data
      }).catch((error) => {
        console.error(error)
      })

      // set address type codes for institute addresses
      InstituteService.getAddressTypeCodes().then((response) => {
        this.addressTypeCodes = response.data
      }).catch((error) => {
        console.error(error)
      })

      InstituteService.getGradeCodes().then((response) => {
        this.gradeCodes = response.data
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
    getDistrictByDistrictId: (state) => {
      return (districtId: string) => state.districts.find((district) => districtId === district.districtId)
    },
    getDistrictByDistrictNumber: (state) => {
      return (distNum: string): ListDistrict | undefined => state.districts.find((district: ListDistrict): Boolean => distNum === district.districtNumber)
    },
    // Independent Authorities
    getAuthorities: (state) => {
      return state.authorities
    },
    getAuthoritiesList: (state) => {
      return state.authorities.map((authority) => {return {authorityNumber: authority.authorityNumber, displayName: authority.displayName}})
    },
    getAuthorityByAuthorityId: (state) => {
      return (authorityId: string) => state.authorities.find((authority) => authorityId === authority.independentAuthorityId)
    },
    getAuthorityByAuthorityNumber: (state) => {
      return (authNum: string | String) => state.authorities.find((authority) => authNum === authority.authorityNumber)
    },
    // Schools
    getSchools: (state) => {
      return state.schools
    },
    getOffshoreSchools: (state) => {
      return state.offshoreSchools
    },
    // Codes
    getGradeByGradeCodes: (state) => {
      return state.gradeCodes
    },
    getContactTypeCodes: (state) => {
      return state.contactTypeCodes
    },
    getDistrictContactTypeCodes: (state) => {
      return state.contactTypeCodes.codesList.districtContactTypeCodes
    },
    getDistrictContactTypeCodeLabel: (state) => {
      return (searchCode: string ) => state.contactTypeCodes.codesList.districtContactTypeCodes.find((contactCode: any) => searchCode === contactCode.districtContactTypeCode)?.label
    },
    getAllDistrictContactTypeCodesLabel: (state) => {
      const sortedTypeCode = state.contactTypeCodes.codesList.districtContactTypeCodes.map((item: any) => item.label).sort();
      return sortedTypeCode;
    },
    getCategoryCodes: (state) => {
      return state.categoryCodes
    },
    getCategoryCodeLabel: (state) => {
      return (searchCode: string ) => state.categoryCodes.find((categoryCode) => searchCode === categoryCode.schoolCategoryCode)?.label
    },
    getFacilityCodes: (state) => {
      return state.facilityCodes
    },
    getFacilityCodeLabel: (state) => {
      return (searchCode: string ) => state.facilityCodes.find((facilityTypeCode) => searchCode === facilityTypeCode.facilityTypeCode)?.label
    },
    getAddressTypeCodes: (state) => {
      return state.addressTypeCodes
    },
    getAddressTypeCodeLabel: (state) => {
      return (searchCode: string ) => state.addressTypeCodes.find((addressTypeCode) => searchCode === addressTypeCode.addressTypeCode)?.label
    },
  }
});
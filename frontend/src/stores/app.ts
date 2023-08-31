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
  displayName?: string;

}

interface Code {
  label: string;
  description: string;
}

interface CategoryCode extends Code {
  schoolCategoryCode: string;
}

interface FacilityCode extends Code {
  facilityTypeCode: string;
}

interface AddressTypeCode extends Code {
  addressTypeCode: string;
}

interface DistrictContactTypeCode extends Code {
  districtContactTypeCode: string;
}

interface CodesList {
  authorityContactTypeCodes: [],
  districtContactTypeCodes: DistrictContactTypeCode[];
  schoolContactTypeCodes: [];
}

interface ContactTypeCode {
  codesList: CodesList,

}
interface GradeCode {
  schoolGradeCode: string,
  label: string,
  description: string,
}
import InstituteService from '@/services/InstituteService'

export const useAppStore = defineStore('app', {
  state: () => ({
    districts: [] as District[],
    authorities: [] as Authority[],
    schools: [] as School[],
    categoryCodes: [] as CategoryCode[],
    facilityCodes: [] as FacilityCode[],
    addressTypeCodes: [] as AddressTypeCode[],
    contactTypeCodes: {} as ContactTypeCode,
    gradeCodes: [] as GradeCode[]
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
    extractGradeCodes(data: any) {
      const gradeCodes = data.map((item: any) => item.schoolGradeCode).sort();
      // Extract numeric portion of grade codes and convert to numbers
      const numericGrades = gradeCodes.map((code: any) => parseInt(code.match(/\d+/)[0], 10));
      // Find the minimum and maximum grades
      const minGrade = Math.min(...numericGrades);
      const maxGrade = Math.max(...numericGrades);
      // Create the desired range string
      const gradeRange = `${minGrade}-${maxGrade}`;
      return gradeRange
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
      // InstituteService.getAddressTypeCodes().then((response) => {
      //   this.addressTypeCodes = response.data
      // }).catch((error) => {
      //   console.error(error)
      // })
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
      return (distNum: String): District | undefined => state.districts.find((district: District): Boolean => distNum === district.districtNumber)
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
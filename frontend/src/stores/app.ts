import { defineStore } from 'pinia'
// import type definitions
import type {
  ListDistrict,
  ListAuthority,
  ListSchool,
  CategoryCode,
  FacilityCode,
  AddressTypeCode,
  ContactTypeCode,
  GradeCode,
  Grade
} from '@/types/types'

import SchoolService from '@/services/SchoolService'
import DistrictService from '@/services/DistrictService'
import AuthorityService from '@/services/AuthorityService'
import CodesService from '@/services/CodesService'

export const useAppStore = defineStore('app', {
  state: () => ({
    districts: [] as ListDistrict[],
    authorities: [] as ListAuthority[],
    schools: [] as ListSchool[],
    offshoreSchools: [] as ListSchool[],
    offshoreSchoolRepresentatives: [] as ListAuthority[],
    categoryCodes: [] as CategoryCode[],
    facilityCodes: [] as FacilityCode[],
    addressTypeCodes: [] as AddressTypeCode[],
    contactTypeCodes: {} as ContactTypeCode,
    gradeCodes: [] as Grade[]
  }),
  actions: {
    async setCodes() {
      await this.setDistricts()
      await this.setAuthorityList()
      await this.setSchoolList()
      await this.setOffshoreSchoolList()
      await this.setOffshoreSchoolRepresentatives()
      await this.setContactTypeCodes()
      await this.setCategoryCodes()
      await this.setFacilityCodes()
      await this.setGradeCodes()
      await this.setAddressTypeCodes()
    },
    convertToCSV(jsonArray: any) {
      let csvContent = ''
      if (jsonArray.length === 0) {
        return csvContent
      }
      // Extract headers
      const headers = Object.keys(jsonArray[0])
      csvContent += headers.join(',') + '\n'
      // Extract values
      jsonArray.forEach((item: any) => {
        const values = headers.map((header) => {
          const value = item[header]
          return typeof value === 'string' ? `"${value}"` : value
        })
        csvContent += values.join(',') + '\n'
      })
      return csvContent
    },
    exportCSV(csvData: any, filename = 'download.csv') {
      const utf8EncodedData = new TextEncoder().encode('\uFEFF' + csvData)
      const blob = new Blob([utf8EncodedData], { type: 'text/csv;charset=utf-8' })

      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename // <-- dynamic filename
      a.click()

      // Cleanup URL object later
      URL.revokeObjectURL(a.href)
    },
    mapSchoolGradesToLabels(schoolGrades: Grade[]): Grade[] {
      // If gradeCodes not loaded, fetch them first
      if (!this.gradeCodes || this.gradeCodes.length === 0) {
        this.setGradeCodes()
      }
      // Map the given schoolGrades to the loaded gradeCodes
      return this.gradeCodes.filter((sg1) =>
        schoolGrades.some((sg2) => sg1.schoolGradeCode === sg2.schoolGradeCode)
      )
    },
    extractGradeLabels(schoolGrades: Grade[]) {
      const gradeLabels: (string | undefined)[] = schoolGrades.map((grade) => grade.label)
      return gradeLabels
    },
    isIndependentSchool(schoolCategoryCode: String) {
      return schoolCategoryCode == 'INDEPEND'
    },
    async setDistricts(): Promise<void> {
      await DistrictService.getDistricts()
        .then((response) => {
          // Handle the response data
          this.districts = response.data
        })
        .catch((error) => {
          // Handle the error
          console.error(error)
        })
    },
    async setAuthorityList(): Promise<void> {
      await AuthorityService.getAuthorityList()
        .then((response) => {
          //handle the response
          this.authorities = response.data
        })
        .catch((error) => {
          //handle the error
          console.error(error)
        })
    },
    async setSchoolList(): Promise<void> {
      SchoolService.getSchoolList()
        .then((response) => {
          // Handle the response data
          this.schools = response.data
        })
        .catch((error) => {
          // Handle the error
          console.error(error)
        })
    },
    async setOffshoreSchoolRepresentatives(): Promise<void> {
      InstituteService.getOffshoreSchoolRepresentatives()
        .then((response) => {
          // Handle the response data
          this.offshoreSchoolRepresentatives = response.data
        })
        .catch((error) => {
          // Handle the error
          console.error(error)
        })
    },
    async setOffshoreSchoolList(): Promise<void> {
      SchoolService.getOffshoreSchoolList()
        .then((response) => {
          // Handle the response data
          this.offshoreSchools = response.data
        })
        .catch((error) => {
          // Handle the error
          console.error(error)
        })
    },

    async setContactTypeCodes(): Promise<any> {
      const contactsResponse = await CodesService.getContactTypeCodes()
      this.contactTypeCodes = contactsResponse.data
    },
    async setCategoryCodes(): Promise<any> {
      const categoryCodeResponse = await CodesService.getCategoryCodes()
      this.categoryCodes = categoryCodeResponse.data
    },
    async setFacilityCodes(): Promise<any> {
      const facilityCodeResponse = await CodesService.getFacilityCodes()
      this.facilityCodes = facilityCodeResponse.data
    },
    async setAddressTypeCodes(): Promise<any> {
      const addressTypeCodeResponse = await CodesService.getAddressTypeCodes()
      this.addressTypeCodes = addressTypeCodeResponse.data
    },
    async setGradeCodes(): Promise<any> {
      const gradeCodeResponse = await CodesService.getGradeCodes()
      this.gradeCodes = gradeCodeResponse.data
    }
  },
  getters: {
    // Districts
    getDistricts: (state) => {
      return state.districts
    },
    getDistrictList: (state) => {
      return state.districts.map((district) => {
        return { districtNumber: district.districtNumber, displayName: district.displayName }
      })
    },
    getDistrictByDistrictId: (state) => {
      return (districtId: string) => {
        const result = state.districts.find((district) => districtId === district.districtId)
        return result
      }
    },
    getDistrictByDistrictNumber: (state) => {
      return (distNum: string): ListDistrict | undefined =>
        state.districts.find(
          (district: ListDistrict): Boolean => distNum === district.districtNumber
        )
    },
    // Independent Authorities
    getAuthorities: (state) => {
      return state.authorities
    },
    getAuthoritiesList: (state) => {
      return state.authorities
        .map((authority) => ({
          authorityNumber: authority.authorityNumber,
          displayName: authority.displayName
        }))
        .sort((a, b) => Number(a.authorityNumber) - Number(b.authorityNumber))
    },
    getAuthorityByAuthorityId: (state) => {
      return (authorityId: string) => {
        return state.authorities.find((authority) => authority.authorityID === authorityId)
      }
    },
    getAuthorityByAuthorityNumber: (state) => {
      return (authNum: string) => {
        return state.authorities.find((authority) => authority.authorityNumber === authNum)
      }
    },
    // Schools
    getSchools: (state) => {
      return state.schools
    },
    getOffshoreSchools: (state) => {
      return state.offshoreSchools
    },
    // Codes
    getGradeCodes: (state) => {
      return state.gradeCodes ?? []
    },
    getContactTypeCodes: (state) => {
      return state.contactTypeCodes
    },
    getDistrictContactTypeCodes: (state) => {
      return state.contactTypeCodes.codesList.districtContactTypeCodes
    },
    getDistrictContactTypeCodeLabel: (state) => {
      return (searchCode: string) =>
        state.contactTypeCodes.codesList.districtContactTypeCodes.find(
          (contactCode: any) => searchCode === contactCode.districtContactTypeCode
        )?.label
    },
    getAuthorityContactTypeCodeLabel: (state) => {
      return (searchCode: string) =>
        state.contactTypeCodes.codesList.authorityContactTypeCodes.find(
          (contactCode: any) => searchCode === contactCode.authorityContactTypeCode
        )?.label
    },
    getAllDistrictContactTypeCodesLabel: (state) => {
      const sortedTypeCode = state.contactTypeCodes.codesList.districtContactTypeCodes
        .map((item: any) => item.label)
        .sort()
      return sortedTypeCode
    },

    getCategoryCodes: (state) => {
      return state.categoryCodes
    },
    getCategoryCodeLabel: (state) => {
      return (searchCode: string) =>
        state.categoryCodes.find((categoryCode) => searchCode === categoryCode.schoolCategoryCode)
          ?.label
    },
    getFacilityCodes: (state) => {
      return state.facilityCodes
    },
    getFacilityCodeLabel: (state) => {
      return (searchCode: string) =>
        state.facilityCodes.find(
          (facilityTypeCode) => searchCode === facilityTypeCode.facilityTypeCode
        )?.label
    },
    getAddressTypeCodes: (state) => {
      return state.addressTypeCodes
    },
    getAddressTypeCodeLabel: (state) => {
      return (searchCode: string) =>
        state.addressTypeCodes.find(
          (addressTypeCode) => searchCode === addressTypeCode.addressTypeCode
        )?.label
    }
  }
})

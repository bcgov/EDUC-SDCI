import ApiService from '../common/apiService'
import { type AxiosResponse } from 'axios'

export default {
  // Districts
  async getDistricts(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district/list')
  },
  //DO NOT USE; TODO: Factor this out and use getDistrictView instead
  getDistrict(districtId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district/' + districtId)
  },
  // Independent Authorities
  async getAuthorityList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/authority/list')
  },
  async getAuthority(authorityId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/authority/' + authorityId)
  },
  // Schools
  async getSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/list')
  },
  async getOffshoreSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/offshore-school/list')
  },
  async getSchool(schoolId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/school/' + schoolId)
  },
  // Codes
  async getFacilityCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/facility-codes')
  },
  async getCategoryCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/category-codes')
  },
  async getContactTypeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/contact-type-codes')
  },
  async getGradeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/grade-codes')
  },
  async getAddressTypeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/address-type-codes')
  },

  searchSchools(req: any): Promise<AxiosResponse> {
    const searchCriteriaList = req.searchCriteriaList || ''
    const pageSize = req.pageSize.value || '' // Set a default value if not provided
    const pageNumber = req.pageNumber || '' // Set a default value if not provided
    const sortOrder = req.sort && req.sort.order ? req.sort.order.toUpperCase() : ''
    const sortField = req.sort && req.sort.key ? req.sort.key : ''
    //let url = `/api/v1/search/institute/school/paginated?pageSize=${pageSize}&pageNumber=${pageNumber}&searchCriteriaList=${searchCriteriaList}`;
    let url = `/api/v1/search/schools/paginated?pageSize=${pageSize}&pageNumber=${pageNumber}&searchCriteriaList=${searchCriteriaList}`
    if (sortOrder && sortField) {
      url += `&sort[${sortField}]=${sortOrder}`
    }
    return ApiService.apiAxios.get(url)
  },
  searchContactByType(req: any): Promise<AxiosResponse> {
    const searchCriteriaList = req.searchCriteriaList || ''
    const pageSize = req.pageSize.value || '' // Set a default value if not provided
    const pageNumber = req.pageNumber || '' // Set a default value if not provided
    const sortOrder = req.sort && req.sort.order ? req.sort.order.toUpperCase() : ''
    const sortField = req.sort && req.sort.key ? req.sort.key : ''
    let url = `/api/v1/institute/district/contact/paginated?pageSize=${pageSize}&pageNumber=${pageNumber}&searchCriteriaList=${searchCriteriaList}`
    if (sortOrder && sortField) {
      url += `&sort[${sortField}]=${sortOrder}`
    }
    return ApiService.apiAxios.get(url)
  },
  getDistrictView(id: string | undefined): Promise<AxiosResponse> {
    return ApiService.apiAxios.get(`/api/v1/district/${id}`)
  },
  getDistrictContactTypeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district-contact-type-codes')
  },
  async loadCache(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/create-cache')
  }
}

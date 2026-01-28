import ApiService from '../common/apiService'
import { type AxiosResponse } from 'axios'

export default {
  async getFacilityCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/codes/facility-codes')
  },
  async getCategoryCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/codes/category-codes')
  },
  async getContactTypeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/codes/contact-type-codes')
  },
  async getGradeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/codes/grade-codes')
  },
  async getAddressTypeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/codes/address-type-codes')
  }
}

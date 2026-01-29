import ApiService from '../common/apiService'
import { type AxiosResponse } from 'axios'

export default {
  async getDistricts(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/district/school-districts-list')
  },
  async getDistrictView(id: string | undefined): Promise<AxiosResponse> {
    return ApiService.apiAxios.get(`/api/district/${id}`)
  },
  async searchContactByType(req: any): Promise<AxiosResponse> {
    const searchCriteriaList = req.searchCriteriaList || ''
    const pageSize = req.pageSize.value || '' // Set a default value if not provided
    const pageNumber = req.pageNumber || '' // Set a default value if not provided
    const sortOrder = req.sort && req.sort.order ? req.sort.order.toUpperCase() : ''
    const sortField = req.sort && req.sort.key ? req.sort.key : ''
    let url = `/api/search/district/contact-search/paginated?pageSize=${pageSize}&pageNumber=${pageNumber}&searchCriteriaList=${searchCriteriaList}`
    if (sortOrder && sortField) {
      url += `&sort[${sortField}]=${sortOrder}`
    }
    return ApiService.apiAxios.get(url)
  },
  async searchContactByType2(type: string, req: any): Promise<AxiosResponse> {
    const pageSize = req.pageSize?.value || 1000
    const pageNumber = req.pageNumber || 0
    const sortOrder = req.sort?.order ? req.sort.order.toUpperCase() : ''
    const sortField = req.sort?.key ? req.sort.key : ''
    const params: any = { pageSize, pageNumber }
    if (sortOrder && sortField) {
      params.sortField = sortField
      params.sortOrder = sortOrder
    }
    return ApiService.apiAxios.get(`/api/search/district/contact-search/${type}`, { params })
  }
}

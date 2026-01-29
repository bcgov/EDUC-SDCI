import ApiService from '../common/apiService'
import { type AxiosResponse } from 'axios'

export default {
  async getSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/school/schools-list')
  },
  async getSchool(schoolId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/school/' + schoolId)
  },
  async searchSchools(req: any): Promise<AxiosResponse> {
    const params = new URLSearchParams()

    // Append standard pagination params
    params.append('pageNumber', req.pageNumber || 0)
    params.append('pageSize', req.pageSize.value || 10)

    // Append sorting if it exists
    if (req.sort && req.sort.key && req.sort.order) {
      params.append(`sort[${req.sort.key}]`, req.sort.order.toUpperCase())
    }

    // Append filter params (only if they exist)
    if (req.jurisdiction && req.jurisdiction.length) {
      params.append('jurisdiction', req.jurisdiction.join(','))
    }
    if (req.type && req.type.length) {
      params.append('type', req.type.join(','))
    }

    // Construct URL
    const url = `/api/search/school?${params.toString()}`

    return ApiService.apiAxios.get(url)
  },
  // OFFSHORE SCHOOLS
  async getOffshoreSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/school/offshore-schools-list')
  },
  async getOffshoreSchoolRepresentatives(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/school/offshore-representatives')
  }
}

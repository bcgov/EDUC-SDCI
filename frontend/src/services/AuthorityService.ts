// Independent Authorities
import ApiService from '../common/apiService'
import { type AxiosResponse } from 'axios'

export default {
  async getAuthorityList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/authority/independent-authorities-list')
  },
  async getAuthority(authorityId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/authority/' + authorityId)
  }
}

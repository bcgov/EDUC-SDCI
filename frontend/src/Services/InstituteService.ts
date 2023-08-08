import ApiService from '../common/apiService';
import { type AxiosResponse } from 'axios';

export default {
  getDistricts(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district');
  },
  getDistrict(districtId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district/'+districtId);
  },
  getAuthorities(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('api/v1/institute/authority');
  },
  getAuthority(authorityId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/authority/'+ authorityId)
  },
  getSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/list');
  },
  getSchool(schoolId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/'+schoolId);
  }  
  
}
import ApiService from '../common/apiService';
import { type AxiosResponse } from 'axios';

export default {
  // Districts
  getDistricts(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district');
  },
  getDistrict(districtId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district/'+districtId);
  },
  getDistrictView(id: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get(`/api/v1/district/${id}`)
  },
  // Independent Authorities
  getAuthorities(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/authority');
  },
  getAuthority(authorityId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/authority/'+ authorityId)
  },
  // Schools
  getSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/list');
  },
  getSchool(schoolId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/'+schoolId);
  },
  searchSchools(req: any): Promise<AxiosResponse> {
    console.log(req.searchCriteriaList)
    return ApiService.apiAxios.get('/api/v1/institute/school/paginated?pageSize=10&searchCriteriaList=' + req.searchCriteriaList);
  },
  // Codes
  getFacilityCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/facility-codes');
  },
  getCategoryCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/category-codes');
  },
  getGradeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/grade-codes');
  },
  getDistrictContactTypeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district-contact-type-codes');
  },

}
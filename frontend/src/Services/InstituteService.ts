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
    return ApiService.apiAxios.get('/api/v1/institute/authority');
  },
  getAuthority(authorityId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/authority/'+ authorityId)
  },
  getSchoolList(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/list');
  },
  getSchool(schoolId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/school/'+schoolId);
  },
  getFacilityCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/facility-codes');
  },
  getCategoryCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/category-codes');
  },
  getGradeCodes(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/grade-codes');
  },
  // searchSchools(req: any): Promise<AxiosResponse> {
  //   console.log(req.searchCriteriaList)
  //   return ApiService.apiAxios.get('/api/v1/institute/school/paginated?pageSize=10&searchCriteriaList=' + req.searchCriteriaList);
  // },
  searchSchools(req: any): Promise<AxiosResponse> {
    const searchCriteriaList = req.searchCriteriaList || '';
    const pageSize = req.pageSize.value || ''; // Set a default value if not provided
    const pageNumber = req.pageNumber || ''; // Set a default value if not provided
    //const sort = req.sort.value || ''; // Set a default value if not provided
    const url = `/api/v1/institute/school/paginated?pageSize=${pageSize}&pageNumber=${pageNumber}&searchCriteriaList=${searchCriteriaList}`;

    return ApiService.apiAxios.get(url);
  },  
  getDistrictView(id: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get(`/api/v1/district/${id}`)
  }

}
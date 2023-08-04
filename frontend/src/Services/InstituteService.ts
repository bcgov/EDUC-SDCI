import ApiService from '../common/apiService';
import { type AxiosResponse } from 'axios';

export default {
  getDistricts(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district');
  },
  getDistrict(districtId: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district/'+districtId);
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
  searchSchools(req: any): Promise<AxiosResponse> {
    console.log(req);
  
    // Make the API request with the provided search criteria
    try {
      return ApiService.apiAxios.get('/api/v1/institute/school/paginated', req)

    } catch (error) {
      // Handle errors if the API request fails
      console.error('Error fetching school data:', error);
      throw error;
    }
  }

}
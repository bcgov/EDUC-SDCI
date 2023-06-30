import ApiService from '../common/apiService';
import { type AxiosResponse } from 'axios';

export default {
  getDistricts(): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/district');
  },
  getDistrict(params: string): Promise<AxiosResponse> {
    return ApiService.apiAxios.get('/api/v1/institute/districts');
  }  
}
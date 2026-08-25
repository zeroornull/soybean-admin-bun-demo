import { request } from '@/service/request';

export interface DashboardServiceStatus {
  service: string;
}

export function fetchDashboardServiceStatus(simulateError = false) {
  return request<DashboardServiceStatus>({
    url: simulateError ? '/test/http-500' : '/health',
    method: 'GET'
  });
}

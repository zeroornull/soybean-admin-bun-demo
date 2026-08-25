import { demoRequest, request } from '@/service/request';

export interface DashboardServiceStatus {
  service: string;
}

export function fetchDashboardServiceStatus(simulateError = false) {
  return request<DashboardServiceStatus>({
    url: simulateError ? '/test/http-500' : '/health',
    method: 'GET'
  });
}

export function fetchProtectedServiceStatus() {
  return request<DashboardServiceStatus>({
    url: '/test/protected',
    method: 'GET'
  });
}

export function fetchOtherServiceStatus() {
  if (!demoRequest) {
    return Promise.resolve({
      data: null,
      error: { kind: 'network' as const, message: 'Other service is not configured' }
    });
  }

  return demoRequest<DashboardServiceStatus>({
    url: '/ping',
    method: 'GET'
  });
}

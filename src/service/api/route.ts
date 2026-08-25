import { request } from '../request';
import type { BackendRoute } from '@/router/map-backend-routes';

export interface UserRoutePayload {
  routes: BackendRoute[];
  home: string;
}

export function fetchGetUserRoutes() {
  return request<UserRoutePayload>({
    url: '/route/getUserRoutes'
  });
}

export function fetchIsRouteExist(path: string) {
  return request<boolean>({
    url: '/route/isRouteExist',
    params: { path }
  });
}

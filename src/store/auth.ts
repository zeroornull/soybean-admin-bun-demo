import { ref } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from './ids';

export interface UserInfo {
  userId: string;
  userName: string;
  roles: string[];
  buttons: string[];
}

/** Authentication session state; R09 will add login and reset actions. */
export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const token = ref('');
  const userInfo = ref<UserInfo | null>(null);

  return {
    token,
    userInfo
  };
});

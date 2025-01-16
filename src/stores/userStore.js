import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null, // Almacena el ID del usuario
  }),
  actions: {
    setUserId(id) {
      this.userId = id;
    },
  },
});

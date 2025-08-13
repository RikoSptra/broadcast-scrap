import localforage from 'localforage';
import { AuthUser } from '@/types/auth';

const AUTH_KEY = 'auth_user';
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

export const auth = {
  async getUser(): Promise<AuthUser | null> {
    try {
      const user = await localforage.getItem<AuthUser>(AUTH_KEY);
      if (!user) return null;

      // Cek apakah token sudah expired
      if (user.expiresAt && user.expiresAt < Date.now()) {
        await this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async login(username: string, token: string): Promise<void> {
    const user: AuthUser = {
      username,
      token,
      expiresAt: Date.now() + TOKEN_EXPIRY_TIME
    };

    try {
      await localforage.setItem(AUTH_KEY, user);
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Gagal menyimpan data login');
    }
  },

  async logout(): Promise<void> {
    try {
      await localforage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  },

  async getToken(): Promise<string | null> {
    const user = await this.getUser();
    return user?.token || null;
  }
}; 
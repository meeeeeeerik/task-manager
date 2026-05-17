import { makeAutoObservable, runInAction } from 'mobx';
import { authApi } from '../utils/api';
import type { User } from '../types';

class AuthStore {
  user: User | null = JSON.parse(localStorage.getItem('tm_user') || 'null');
  token: string | null = localStorage.getItem('tm_token');
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isAuthenticated() {
    return !!this.user;
  }

  login = async (email: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const res = await authApi.login(email, password);
      runInAction(() => {
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('tm_token', res.data.token);
        localStorage.setItem('tm_user', JSON.stringify(res.data.user));
        this.isLoading = false;
      });
      return true;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.error = e.response?.data?.error || 'Login failed';
        this.isLoading = false;
      });
      return false;
    }
  };

  register = async (name: string, email: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const res = await authApi.register(name, email, password);
      runInAction(() => {
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('tm_token', res.data.token);
        localStorage.setItem('tm_user', JSON.stringify(res.data.user));
        this.isLoading = false;
      });
      return true;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.error = e.response?.data?.error || 'Registration failed';
        this.isLoading = false;
      });
      return false;
    }
  };

  logout = () => {
    this.user = null;
    this.token = null;
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
  };

  clearError = () => {
    this.error = null;
  };
}

export const authStore = new AuthStore();

const API_BASE = window.location.origin;

export class Auth {
  constructor() {
    this.token = null;
    this.user = null;
    this.init();
  }

  init() {
    const token = localStorage.getItem('portal_token');
    const userStr = localStorage.getItem('portal_user');
    
    if (token && userStr) {
      this.token = token;
      this.user = JSON.parse(userStr);
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  async verifySession() {
    if (!this.token) {
      this.redirectToLogin();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      this.user = data.user;
      return true;
    } catch (error) {
      console.error('Session verification failed:', error);
      this.logout();
      return false;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('portal_token', this.token);
      localStorage.setItem('portal_user', JSON.stringify(this.user));

      return true;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    const token = this.token;
    
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(console.error);
    }

    this.token = null;
    this.user = null;

    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');

    this.redirectToLogin();
  }

  redirectToLogin() {
    window.location.href = '/auth/login.html';
  }

  updateUserInfo(userInfo) {
    this.user = { ...this.user, ...userInfo };
    localStorage.setItem('portal_user', JSON.stringify(this.user));
  }
}

export const auth = new Auth();

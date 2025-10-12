import Cookies from 'js-cookie';
import { API_URL, JWT_COOKIE_NAME, ERROR_CODES } from './constants';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.tokenKey = JWT_COOKIE_NAME;
  }

  // Get auth token from cookies
  getToken() {
    return Cookies.get(this.tokenKey);
  }

  // Set auth token in cookies
  setToken(token) {
    Cookies.set(this.tokenKey, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // Remove auth token
  removeToken() {
    Cookies.remove(this.tokenKey);
  }

  // Build headers for requests
  buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred');
      error.status = response.status;
      error.code = data.code || ERROR_CODES.SERVER_ERROR;
      error.details = data.details;
      throw error;
    }

    return data;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.buildHeaders(options.headers),
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        const networkError = new Error('Network error. Please check your connection.');
        networkError.code = ERROR_CODES.NETWORK_ERROR;
        throw networkError;
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Upload file
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);

    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await this.handleResponse(response);
  }

  // Authentication APIs
  auth = {
    // Platform-level authentication (for site owners)
    platformLogin: (credentials) => this.post('/api/auth/platform/login', credentials),
    platformSignup: (userData) => this.post('/api/auth/platform/signup', userData),
    
    // Tenant-specific authentication (for site users)
    login: (credentials) => this.post('/api/auth/login', credentials),
    signup: (userData) => this.post('/api/auth/signup', userData),
    
    logout: () => {
      this.removeToken();
      return Promise.resolve();
    },
    refresh: () => this.post('/api/auth/refresh'),
    me: () => this.get('/api/auth/me'),
  };

  // Sites APIs
  sites = {
    create: (siteData) => this.post('/api/sites', siteData),
    get: (siteId) => this.get(`/api/sites/${siteId}`),
    update: (siteId, siteData) => this.put(`/api/sites/${siteId}`, siteData),
    list: (params) => this.get('/api/sites', params),
    resolve: (domain) => this.get('/api/sites/resolve', { domain }),
    verifyDomain: (siteId) => this.get(`/api/sites/${siteId}/verify-domain`),
  };

  // Themes APIs
  themes = {
    list: (siteId) => this.get('/api/themes', { siteId }),
    get: (themeId) => this.get(`/api/themes/${themeId}`),
    create: (themeData) => this.post('/api/themes', themeData),
    update: (themeId, themeData) => this.put(`/api/themes/${themeId}`, themeData),
    delete: (themeId) => this.delete(`/api/themes/${themeId}`),
  };

  // Auctions APIs
  auctions = {
    list: (params) => this.get('/api/auctions', params),
    get: (auctionId) => this.get(`/api/auctions/${auctionId}`),
    create: (auctionData) => this.post('/api/auctions', auctionData),
    update: (auctionId, auctionData) => this.put(`/api/auctions/${auctionId}`, auctionData),
    delete: (auctionId) => this.delete(`/api/auctions/${auctionId}`),
    start: (auctionId) => this.post(`/api/auctions/${auctionId}/start`),
    end: (auctionId) => this.post(`/api/auctions/${auctionId}/end`),
    pause: (auctionId) => this.post(`/api/auctions/${auctionId}/pause`),
    nextItem: (auctionId) => this.post(`/api/auctions/${auctionId}/next-item`),
  };

  // Bids APIs
  bids = {
    list: (auctionId, itemIndex) => this.get(`/api/bids`, { auctionId, itemIndex }),
    place: (bidData) => this.post('/api/bids', bidData),
    myBids: () => this.get('/api/bids/my-bids'),
  };

  // Upload APIs
  uploads = {
    image: (file, siteId) => this.upload('/api/upload/images', file, { siteId }),
    logo: (file, siteId) => this.upload('/api/upload/logo', file, { siteId }),
  };
}

// Create singleton instance
const api = new ApiClient();

export default api;

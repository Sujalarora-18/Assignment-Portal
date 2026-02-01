// src/Api/api.js
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

/**
 * Read token from localStorage and return Authorization header object
 */
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch-style request wrapper (keeps same signature used by departments.js)
 * Accepts same options as fetch (method, headers, body, etc.)
 * Also supports 'data' option (like axios) which auto-converts to JSON body
 */
export async function request(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeader(),
    ...(options.headers || {}),
  };

  // Support both 'body' (raw) and 'data' (auto-stringify) options
  let body = options.body;
  if (options.data && !body) {
    body = typeof options.data === "string" 
      ? options.data 
      : JSON.stringify(options.data);
  }

  const res = await fetch(BASE + url, {
    headers,
    method: options.method || "GET",
    body,
    cache: options.cache || "no-store",
    credentials: options.credentials || "same-origin",
    redirect: options.redirect || "follow",
    signal: options.signal || null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Axios instance for parts of app that use axios
 * It sets Authorization header automatically.
 */
export const axiosInstance = axios.create({
  baseURL: BASE,
});

axiosInstance.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
}, (err) => Promise.reject(err));

export default {
  BASE,
  request,
  axiosInstance,
};

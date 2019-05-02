import '../lib/xxtea.min.js'
import 'whatwg-fetch';
import jwtDecode from 'jwt-decode';
import platform from 'utils/platform';
import isEmpty from 'lodash.isempty';
import { getRandomId } from 'utils/messaging';

const VERSION = __goldtime_EXTENSION_CONFIG__.version;
const APP_URL = __goldtime_EXTENSION_CONFIG__.app_url;
const API_URL = `${APP_URL}/api/v2`;
const STORAGE_TOKEN_KEY = 'goldtime.extension.token';
const STORAGE_ACTIVE_COMPANY_KEY = 'goldtime.extension.active_company_id';

let CURRENT_USER;
let CURRENT_USER_COMPANIES = [];
let SERVER_CHECKIN;

let onAuthorizationCallback = (isAuthorized) => {};

export function onAuthorization(callback) {
  onAuthorizationCallback = (isAuthorized) => {
    callback(isAuthorized);
    if (! isAuthorized) {
      CURRENT_USER = null;
      CURRENT_USER_COMPANIES = [];
    }
  };
  onAuthorizationCallback(isAuthorized());
}

function getApiCallHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'X-Extension-Version': VERSION,
    'X-Extension-Platform': platform,
  };
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function normalApiCall(method, path, options = {}) {
  const fetchOptions = {
    method: method,
    headers: getApiCallHeaders(),
  };

  if (! isEmpty(options.data)) fetchOptions.body = JSON.stringify(options.data);

  return fetch(`${API_URL}${path}`, fetchOptions).then(async (response) => {
    response.parsedJson = await response.json();
    return response;
  });
}

function encryptedApiCall(method, path, options = {}) {
  const fetchOptions = {
    method: 'POST',
    headers: getApiCallHeaders(),
  };

  const payload = {
    method: method,
    path: path,
    noise: getRandomId()
  };

  if (! isEmpty(options.data)) payload.body = options.data;

  const encrypted = XXTEA.encryptToBase64(JSON.stringify(payload), __goldtime_EXTENSION_CONFIG__.encryption_key);

  fetchOptions.body = JSON.stringify({ '_' : encrypted });

  return fetch(`${API_URL}/rpc`, fetchOptions).then(async (response) => {
    const json = await response.json();
    const decrypted = JSON.parse(XXTEA.decryptFromBase64(json._, __goldtime_EXTENSION_CONFIG__.encryption_key));
    response.parsedJson = decrypted.response;
    return response;
  });
}

export function apiCall(method, path, options = {}) {
  if (__goldtime_EXTENSION_CONFIG__.encryption_enabled) {
    return encryptedApiCall(method, path, options);
  }
  
  return normalApiCall(method, path, options);
}

export function isAuthorized() {
  const authorized = !!localStorage.getItem(STORAGE_TOKEN_KEY);
  return authorized;
}

export async function fetchServerCheckin() {
  const response = await apiCall('GET', '/extension');
  if (response.ok) {
    SERVER_CHECKIN = response.parsedJson;
    return SERVER_CHECKIN;
  }
  return null;
}

export async function getServerCheckin() {
  return SERVER_CHECKIN || fetchServerCheckin();
}

export async function login(email, password) {
  const response = await apiCall('POST', '/login', { data: { email, password } });
  const json = response.parsedJson;
  if (response.ok && json.authorized && json.token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, json.token)
    onAuthorizationCallback(isAuthorized());
    return true;
  }
  else {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    onAuthorizationCallback(isAuthorized());
    return false;
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  onAuthorizationCallback(isAuthorized());
  return true;
}

export async function fetchCurrentUser() {
  if (! isAuthorized()) return null;

  const response = await apiCall('GET', '/users/current');
  if (response.ok) {
    CURRENT_USER = response.parsedJson;
    return CURRENT_USER;
  }
  return null;
}

export async function getCurrentUser() {
  return CURRENT_USER || fetchCurrentUser();
}

function normalizeCompanies() {
  CURRENT_USER_COMPANIES = CURRENT_USER_COMPANIES.reduce((companies, company) => {
    if (company.role == 'owner') {
      companies.push(company);
      companies = companies.filter((c) => !(c.id == company.id && c.role == 'customer'));
    }
    else if (company.role == 'customer') {
      const existingOwner = companies.findIndex((c) => c.id == company.id && c.role == 'owner');
      if (existingOwner == -1) {
        companies.push(company);
      }
    }
    return companies;
  }, []);
}

function assignActiveCompany() {
  const activeCompanyId = getActiveCompanyId();
  CURRENT_USER_COMPANIES = CURRENT_USER_COMPANIES.map((company) => {
    company.active = company.id == activeCompanyId;
    return company;
  });
}

export async function fetchCurrentUserCompanies() {
  if (! isAuthorized()) return [];

  const response = await apiCall('GET', '/companies');
  if (response.ok) {
    CURRENT_USER_COMPANIES = response.parsedJson;
    normalizeCompanies();
    assignActiveCompany();
    return CURRENT_USER_COMPANIES || [];
  }
  return null;
}

export async function getCurrentUserCompanies() {
  normalizeCompanies();
  assignActiveCompany();
  return CURRENT_USER_COMPANIES || fetchCurrentUserCompanies();
}

export async function fetchCurrentUserBalance() {
  if (! isAuthorized()) return [];

  const response = await apiCall('GET', '/balances');
  if (response.ok) {
    return response.parsedJson || [];
  }
  return null;
}


export async function checkVideoContext(context = {}) {
  const response = await apiCall('POST', '/watch/check', { data: context });
  if (response.ok) {
    return response.parsedJson;
  }
  return null;
}

export async function saveWatchedInterval(watched) {
  const data = Object.assign({ client_type: 'extension' }, watched);
  const response = await apiCall('POST', '/watch', { data });
  return response;
}

export function setActiveCompanyId(company_id) {
  localStorage.setItem(STORAGE_ACTIVE_COMPANY_KEY, company_id);
}

export function getActiveCompanyId() {
  const companyId = localStorage.getItem(STORAGE_ACTIVE_COMPANY_KEY)
  return companyId ? parseInt(companyId, 10) : null;
}
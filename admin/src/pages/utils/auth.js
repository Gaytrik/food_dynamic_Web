// src/utils/auth.js
export const TOKEN_KEY = "aadhi_token";
export const USER_EMAIL = "aadhi_user_email";

export const saveAuth = (token, email) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_EMAIL, email);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getEmail = () => localStorage.getItem(USER_EMAIL);

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL);
};

export const isLoggedIn = () => !!getToken();

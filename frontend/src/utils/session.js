const USER_KEY = "userEcoCampus";
const TOKEN_KEY = "ecoToken";

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setSession = ({ token, user } = {}) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const updateUser = (datos) => {
  const usuario = getUser();
  if (!usuario) return null;

  const actualizado = { ...usuario, ...datos };
  setSession({ user: actualizado });
  return actualizado;
};

export const clearSession = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => Boolean(getToken() && getUser());

export const esAdmin = () => getUser()?.role === "admin";

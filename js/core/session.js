const USER_KEY = "userEcoCampus";
const TOKEN_KEY = "ecoToken";

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};

export const setUser = (user) => {
    if (!user) return null;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
};

export const updateUser = (patch) => {
    const user = getUser();
    if (!user) return null;
    return setUser({ ...user, ...patch });
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setSession = ({ token, user } = {}) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) setUser(user);
};

export const clearSession = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => Boolean(getToken() && getUser());

export const isAdmin = () => getUser()?.role === "admin";

export const requireSession = ({ admin = false, redirect = "/account.html" } = {}) => {
    const token = getToken();
    const user = getUser();

    if (!token || !user || (admin && user.role !== "admin")) {
        window.location.href = redirect;
        return null;
    }

    return { token, user };
};

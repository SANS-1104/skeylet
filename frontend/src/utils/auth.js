export const isLoggedIn = () => {
  return !!localStorage.getItem("accessToken");
};

export const logout = () => {
  localStorage.removeItem("accessToken");
};

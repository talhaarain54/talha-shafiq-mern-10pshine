import API from "../api/axios";

export const signupService = async (userData) => {
  const { data } = await API.post("/v1/auth/signup", userData); 
  return data;
};

export const loginService = async (userData) => {
  const { data } = await API.post("/v1/auth/signin", userData); 
  return data;
};

export const getMeService = async () => {
  const { data } = await API.get("/v1/auth/me");
  return data;
};

export const logoutService = async () => {
  const { data } = await API.post("/v1/auth/logout");
  return data;
};

export const updateProfileService = async (profileData) => {
  const { data } = await API.put("/v1/auth/update-profile", profileData);
  return data;
};

export const changePasswordService = async (passwordData) => {
  const { data } = await API.put("/v1/auth/change-password", passwordData);
  return data;
};
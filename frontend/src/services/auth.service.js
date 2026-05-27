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

export const verifyEmailService = async (token) => {
  const { data } = await API.get(`/v1/auth/verify-email?token=${token}`);
  return data;
};

export const resendVerificationService = async (email) => {
  const { data } = await API.post("/v1/auth/resend-verification", { email });
  return data;
};

export const forgotPasswordService = async (email) => {
  const { data } = await API.post("/v1/auth/forgot-password", { email });
  return data;
};

export const resetPasswordService = async (token, newPassword) => {
  const { data } = await API.post("/v1/auth/reset-password", { token, newPassword });
  return data;
};
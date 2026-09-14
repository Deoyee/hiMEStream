import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const res = await axiosInstance.post('/auth/signup', signupData);
  return res.data;
}

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get('/auth/me');
  return res.data;
  } catch (error) {
    console.error("Error fetching auth user:", error);
    return null;
  }
}

export const completeOnboarding = async (userData) => {
  const res = await axiosInstance.post('/auth/onboarding', userData)
  return res.data
}

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function rejectFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
  return response.data;
}

export async function cancelFriendRequest(targetId) {
  const response = await axiosInstance.delete(`/users/friend-request/${targetId}/cancel`);
  return response.data;
}

export async function unfriendUser(friendId) {
  const response = await axiosInstance.delete(`/users/friends/${friendId}`);
  return response.data;
}

export async function updateProfile(profileData) {
  const response = await axiosInstance.put("/users/profile", profileData);
  return response.data;
}

export async function getUserById(userId) {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function getChatHistory() {
  const response = await axiosInstance.get("/chat/history");
  return response.data;
}
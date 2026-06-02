import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
});

apiClient.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data?.error;
    if (errorData) {
      return Promise.reject(errorData);
    }
    return Promise.reject({
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server. Please check your connection.",
      details: {},
    });
  }
);

export default apiClient;

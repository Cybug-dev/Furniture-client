import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? (error.response?.status ?? null) : null;
    const code = typeof error?.code === "string" ? error.code : null;
    let type = "unknown";
    let message = "Something went wrong. Please try again.";

    if (isAxiosError) {
      if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
        type = "timeout";
        message = "The request timed out. Please try again.";
      } else if (status === 404) {
        type = "not-found";
        message = "The requested resource was not found.";
      } else if (status >= 500) {
        type = "server";
        message = "The server could not complete the request. Please try again later.";
      } else if (
        !error.response &&
        !axios.isCancel(error) &&
        (error.request || code === "ERR_NETWORK")
      ) {
        type = "network";
        message = "Unable to reach the server. Check your connection and try again.";
      }
    }

    const body = isAxiosError ? error.response?.data : undefined;
    const backendMessage = [body?.message, body?.error?.message, body?.error].find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    // Keep Error semantics; status and code are null when unavailable.
    return Promise.reject(
      Object.assign(new Error(backendMessage ?? message), {
        name: "ApiError",
        status,
        code,
        type,
      }),
    );
  },
);

export default api;

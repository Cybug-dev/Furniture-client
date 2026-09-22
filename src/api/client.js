import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const api = axios.create({
  baseURL: configuredApiUrl.replace(/\/+$/, ""),
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

const shouldRefreshSession = (error) => {
  const request = error.config;

  return (
    error.response?.status === 401 &&
    request?.requiresAuth === true &&
    request?._sessionRefreshAttempted !== true
  );
};

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const toApiError = (error) => {
  const isAxiosError = axios.isAxiosError(error);
  const status = isAxiosError ? (error.response?.status ?? null) : null;
  const code = typeof error?.code === "string" ? error.code : null;
  let type = "unknown";
  let message = "Something went wrong. Please try again.";

  if (isAxiosError) {
    if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
      type = "timeout";
      message = "The request timed out. Please try again.";
    } else if (status === 400) {
      type = "validation";
      message = "Please check the information you entered.";
    } else if (status === 401) {
      type = "unauthorized";
      message = "Your session is no longer valid. Please sign in again.";
    } else if (status === 409) {
      type = "conflict";
      message = "That information is already in use.";
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

  return Object.assign(new Error(backendMessage ?? message), {
    name: "ApiError",
    status,
    code,
    type,
    details: Array.isArray(body?.errors) ? body.errors : [],
  });
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldRefreshSession(error)) {
      error.config._sessionRefreshAttempted = true;

      try {
        await refreshSession();
        return api(error.config);
      } catch {
        // The refresh request is normalized by this interceptor. Return the
        // original protected-request error so callers retain useful context.
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export default api;

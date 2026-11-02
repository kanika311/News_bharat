// Universal client-side fetch helper with credentials and error handling

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : endpoint;

  const defaultHeaders = {
    "Accept": "application/json",
  };

  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token && !options.headers?.Authorization && !options.headers?.authorization) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore storage access restrictions
    }
  }

  let body = options.body;
  if (body !== undefined && body !== null) {
    if (typeof body === "object" && !(body instanceof FormData)) {
      body = JSON.stringify(body);
      defaultHeaders["Content-Type"] = "application/json";
    } else if (!(body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }
  }

  const config = {
    ...options,
    body,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: "include", // send httpOnly cookies
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

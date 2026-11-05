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

  const controller = new AbortController();
  const timeoutMs = options.timeout || 25000;
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (e) {}
  }, timeoutMs);

  const config = {
    ...options,
    signal: options.signal || controller.signal,
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
        const isHtml = /<!DOCTYPE|<html/i.test(text || "");
        data = {
          message: isHtml
            ? `Server returned an error (${res.status}). Please check network or try again.`
            : (text?.slice(0, 200) || `Request failed with status ${res.status}`),
        };
      }
    }

    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError" || err.message?.includes("aborted")) {
      throw new Error("अनुरोध में समय लगा। कृपया पुनः प्रयास करें। (Request timed out)");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

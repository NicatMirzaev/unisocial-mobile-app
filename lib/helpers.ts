import * as SecureStore from "expo-secure-store";

export const fetchData = async (
  url: string,
  data: any = {},
  method: string = "GET",
  includeAuthorization: boolean = true
) => {
  let headers: any = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (includeAuthorization) {
    const token = await SecureStore.getItemAsync("token");
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }
  return fetch(process.env.EXPO_PUBLIC_API_URL + url, {
    method,
    headers,
    body: method === "GET" ? undefined : JSON.stringify(data),
  }).then(async (response) => {
    if (response.ok) {
      return response.json();
    }
    const errorResponse = await response.json();
    const error = new Error(errorResponse.message || "დაფიქსირდა შეცდომა");
    (error as any).data = errorResponse;
    (error as any).status = response.status;
    throw error;
  });
};

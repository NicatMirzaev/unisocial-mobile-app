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

export const getInitials = (fullName: string) => {
  if (!fullName) return "";

  const names = fullName.split(" ");
  let initials = "";

  for (let i = 0; i < names.length; i++) {
    const name = names[i].trim();
    if (name) {
      initials += name.charAt(0);
    }
  }

  return initials;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

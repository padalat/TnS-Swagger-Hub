import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { BASE_API } from "./baseApi";
export const uploadCsvFile = async (file,token) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE_API}/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.console.error || "Upload failed");
  }
  return result;
};

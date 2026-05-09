import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@lintshiwe/api-client-react";
import App from "./App";
import "./index.css";

const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl.replace(/\/+$/, ""));
}

createRoot(document.getElementById("root")!).render(<App />);

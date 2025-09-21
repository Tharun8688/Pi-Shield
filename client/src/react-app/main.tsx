import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../../../src/react-app/index.css";
import App from "../../../src/react-app/App";
import { AuthProvider } from "../../../src/react-app/contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
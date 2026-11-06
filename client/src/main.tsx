import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/shared/theme-provider.tsx";
import { requestSocketOriginWarmup } from "@/utils/socketOriginWarmup";
import { z } from "zod";

// Keep Zod 3's "Required" message for missing values (Formik passes empty
// fields as undefined); Zod 4 defaults to "Invalid input: expected ...".
z.config({
  customError: (issue) =>
    (issue.code === "invalid_type" || issue.code === "invalid_value") &&
    issue.input === undefined
      ? "Required"
      : undefined,
});

requestSocketOriginWarmup();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);

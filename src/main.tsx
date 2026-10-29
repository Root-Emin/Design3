import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { router } from "./routes/router";
import { AppStateProvider } from "./state/AppStateProvider";
import { OverlayProvider } from "./state/OverlayProvider";
import { resolveInitialTheme, ThemeProvider } from "./state/ThemeProvider";
import { ToastProvider } from "./state/ToastProvider";
import "./styles/index.css";

// Tema ilk çizimden önce belirlenir; token'lar <html data-theme> üzerinden değişir.
const theme = resolveInitialTheme();
document.documentElement.setAttribute("data-theme", theme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider initial={theme}>
      <AppStateProvider>
        <ToastProvider>
          <OverlayProvider>
            <RouterProvider router={router} />
          </OverlayProvider>
        </ToastProvider>
      </AppStateProvider>
    </ThemeProvider>
  </StrictMode>,
);

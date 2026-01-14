import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import { TanStackQueryClientProvider } from "./components/TanstackQueryClientProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TanStackQueryClientProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TanStackQueryClientProvider>
  </React.StrictMode>,
);

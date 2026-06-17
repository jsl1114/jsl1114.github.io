import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "@fontsource-variable/inter";
import "@fontsource/libre-baskerville/400.css";
import "@fontsource/libre-baskerville/700.css";
import ReactGA from "react-ga4";

ReactGA.initialize("G-8MVEF01ZBJ");
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

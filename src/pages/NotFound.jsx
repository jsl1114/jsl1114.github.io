import { Link } from "react-router-dom";
import Logo from "../assets/logo.svg";

// GitHub Pages serves 404.html for unknown paths, and `npm run deploy` copies
// index.html over it — so a deep link lands in the SPA and falls through to
// this catch-all route.
const NotFound = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center">
      <Link to="/" className="fade-rise absolute top-7 left-6 sm:top-9 sm:left-10">
        <img
          className="w-9 brightness-50 contrast-125 saturate-150 sm:w-10 dark:brightness-100 dark:contrast-100 dark:saturate-100"
          src={Logo}
          alt="Jason Liu logo"
        />
      </Link>

      <p className="fade-rise text-xs font-medium tracking-[0.12em] text-[var(--color-muted)] uppercase dark:text-[var(--color-muted-dark)]">
        Error 404
      </p>

      <h1 className="fade-rise mt-5 text-[56px] leading-[0.95] tracking-[-0.0308em] text-neutral-900 sm:text-[88px] lg:text-[112px] dark:text-white">
        Page{" "}
        <em className="not-italic text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          not found
        </em>
      </h1>

      <p className="fade-rise fade-rise-delay-1 mx-auto mt-6 max-w-[520px] text-[16px] leading-[1.625] text-[var(--color-muted)] sm:text-[18px] dark:text-[var(--color-muted-dark)]">
        The page you are looking for does not exist, or it has moved somewhere
        else. Everything worth reading is back on the home page.
      </p>

      <Link
        to="/"
        className="pill pill-lg fade-rise fade-rise-delay-2 mt-10 sm:mt-12"
      >
        Back home
      </Link>
    </div>
  );
};
export default NotFound;

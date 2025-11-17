import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const matchedSysDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    return matchedSysDarkMode ? "dark" : savedTheme || 'light';
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")

    if (mq.matches) {
      setTheme("dark")
    }

    mq.addEventListener('change', (e) => setTheme(e.matches ? "dark" : "light"))
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

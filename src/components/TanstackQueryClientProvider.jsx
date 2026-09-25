import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const client = new QueryClient();

export const TanStackQueryClientProvider = ({ children }) => {
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
};

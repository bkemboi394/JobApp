// import "@/styles/globals.css";
// import type { AppProps } from "next/app";
//
// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

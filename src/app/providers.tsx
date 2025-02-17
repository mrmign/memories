'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={{
        testnet: { url: getFullnodeUrl('testnet') }
      }}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
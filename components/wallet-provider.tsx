"use client"

import type { ReactNode } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"

interface WalletProviderProps {
  children: ReactNode
}

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, polygon, optimism, arbitrum, base],
    transports: {
      [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [polygon.id]: http(`https://polygon-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [optimism.id]: http(`https://opt-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [arbitrum.id]: http(`https://arb-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [base.id]: http(`https://base-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    appName: "PUMP.SCIENCE",
    appDescription: "Decentralized Science Funding Platform",
    appUrl: "https://pump.science",
    appIcon: "https://pump.science/icon.png",
  }),
)

const queryClient = new QueryClient()

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={{
            "--ck-connectbutton-font-size": "16px",
            "--ck-connectbutton-border-radius": "12px",
            "--ck-connectbutton-color": "#ffffff",
            "--ck-connectbutton-background": "linear-gradient(135deg, #d946ef 0%, #06b6d4 100%)",
            "--ck-connectbutton-box-shadow": "0 10px 25px rgba(217, 70, 239, 0.2)",
            "--ck-connectbutton-hover-background": "linear-gradient(135deg, #c026d3 0%, #0891b2 100%)",
            "--ck-primary-button-border-radius": "12px",
            "--ck-modal-box-shadow": "0 25px 50px rgba(0, 0, 0, 0.5)",
            "--ck-overlay-background": "rgba(0, 0, 0, 0.8)",
            "--ck-modal-background": "rgba(15, 23, 42, 0.95)",
            "--ck-body-background": "rgba(15, 23, 42, 0.95)",
            "--ck-body-color": "#ffffff",
            "--ck-body-color-muted": "rgba(255, 255, 255, 0.7)",
            "--ck-body-color-muted-hover": "#ffffff",
            "--ck-primary-button-background": "linear-gradient(135deg, #d946ef 0%, #06b6d4 100%)",
            "--ck-primary-button-hover-background": "linear-gradient(135deg, #c026d3 0%, #0891b2 100%)",
            "--ck-secondary-button-background": "rgba(255, 255, 255, 0.05)",
            "--ck-secondary-button-hover-background": "rgba(255, 255, 255, 0.1)",
            "--ck-focus-color": "#d946ef",
            "--ck-border-radius": "12px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

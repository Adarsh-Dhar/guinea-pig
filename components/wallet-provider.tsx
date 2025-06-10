"use client"

import type { ReactNode } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base, storyAeneid } from "wagmi/chains"
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
      [storyAeneid.id]: http(`https://aeneid.storyrpc.io`),
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
            "--ck-connectbutton-color": "#111111",
            "--ck-connectbutton-background": "linear-gradient(135deg, #e7cba9 0%, #fffbe9 100%)",
            "--ck-connectbutton-box-shadow": "0 10px 25px rgba(231, 203, 169, 0.2)",
            "--ck-connectbutton-hover-background": "linear-gradient(135deg, #fffbe9 0%, #e7cba9 100%)",
            "--ck-primary-button-border-radius": "12px",
            "--ck-modal-box-shadow": "0 25px 50px rgba(0, 0, 0, 0.5)",
            "--ck-overlay-background": "rgba(17, 17, 17, 0.8)",
            "--ck-modal-background": "rgba(231, 203, 169, 0.95)",
            "--ck-body-background": "rgba(231, 203, 169, 0.95)",
            "--ck-body-color": "#111111",
            "--ck-body-color-muted": "rgba(17, 17, 17, 0.7)",
            "--ck-body-color-muted-hover": "#111111",
            "--ck-primary-button-background": "linear-gradient(135deg, #e7cba9 0%, #fffbe9 100%)",
            "--ck-primary-button-hover-background": "linear-gradient(135deg, #fffbe9 0%, #e7cba9 100%)",
            "--ck-secondary-button-background": "rgba(255, 255, 255, 0.05)",
            "--ck-secondary-button-hover-background": "rgba(255, 255, 255, 0.1)",
            "--ck-focus-color": "#e7cba9",
            "--ck-border-radius": "12px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

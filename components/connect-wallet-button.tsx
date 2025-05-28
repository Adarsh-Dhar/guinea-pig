"use client"

import { useState, useEffect } from "react"
import { ConnectKitButton } from "connectkit"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Wallet, ChevronDown } from "lucide-react"

export default function ConnectWalletButton() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20">
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isConnected ? (
              <div className="flex items-center gap-2">
                {chain?.unsupported ? (
                  <Button
                    onClick={show}
                    variant="outline"
                    className="border-red-400 text-red-400 hover:bg-red-400/10 transition-all duration-300"
                  >
                    Wrong Network
                  </Button>
                ) : (
                  <Button
                    onClick={show}
                    className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      {/* @ts-ignore */}
                      {chain?.hasIcon && (
                        <div className="w-4 h-4 rounded-full overflow-hidden">
                          {/* @ts-ignore */}
                          {chain.iconUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                alt={chain.name ?? "Chain icon"}
                                // @ts-ignore
                              src={chain.iconUrl || "/placeholder.svg"}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      <span className="font-medium">
                        {ensName ?? `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={show}
                disabled={isConnecting}
                className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20 transition-all duration-300"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </motion.div>
        )
      }}
    </ConnectKitButton.Custom>
  )
}

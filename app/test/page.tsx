"use client"
import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useDisconnect, usePublicClient } from 'wagmi';
import { parseEther, decodeEventLog, type Address, type Hash } from 'viem';
import { injected } from 'wagmi/connectors';
import { tokenFactoryAbi } from '@/lib/contract/abi/TokenFactory';
import { contractAddress } from '@/lib/contract/address';

export default function TokenFactory() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
    decimals: '18',
    pricePerToken: ''
  });
  
  const [createdTokens, setCreatedTokens] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle form input changes
  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create token function
  const createToken = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.symbol || !formData.initialSupply || !formData.pricePerToken) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      
      // Convert price from ETH to wei
      const priceInWei = parseEther(formData.pricePerToken);
      
      await writeContract({
        address: contractAddress,
        abi: tokenFactoryAbi,
        functionName: 'createToken',
        args: [
          formData.name,
          formData.symbol,
          BigInt(formData.initialSupply),
          parseInt(formData.decimals),
          priceInWei
        ],
      });
      
    } catch (err) {
      console.error('Error creating token:', err);
      setIsCreating(false);
    }
  };

  // Effect to handle successful transaction
  React.useEffect(() => {
    const extractTokenAddress = async (txHash: Hash) => {
      if (!publicClient || !txHash) return null;
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
        for (const log of receipt.logs) {
          try {
            const decodedLog = decodeEventLog({
              abi: tokenFactoryAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decodedLog.eventName === 'TokenCreated' && decodedLog.args && typeof decodedLog.args === 'object' && 'tokenAddress' in decodedLog.args) {
              // @ts-ignore
              return decodedLog.args.tokenAddress as Address;
            }
          } catch (err) {
            continue;
          }
        }
        return null;
      } catch (err) {
        console.error('Error extracting token address:', err);
        return null;
      }
    };

    if (isConfirmed && hash) {
      (async () => {
        const tokenAddress = await extractTokenAddress(hash);
        if (tokenAddress) {
          console.log('✅ Token created successfully!');
          console.log('Token Address:', tokenAddress);
        } else {
          console.log('Token address could not be extracted from logs.');
        }
      })();
    }

    if (hash) {
      // In a real app, you'd decode the logs to get the token address
      // For now, we'll simulate getting the token address
      const newToken = {
        name: formData.name,
        symbol: formData.symbol,
        initialSupply: formData.initialSupply,
        pricePerToken: formData.pricePerToken,
        txHash: hash,
        timestamp: new Date().toLocaleString()
      };
      // @ts-ignore
      setCreatedTokens((prev) => [newToken, ...prev]);
      console.log('✅ Token created successfully!');
      console.log('Transaction hash:', hash);
      console.log('Token details:', newToken);
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        initialSupply: '',
        decimals: '18',
        pricePerToken: ''
      });
      
      setIsCreating(false);
    }
  }, [isConfirmed, hash, formData, publicClient]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      console.error('Transaction error:', error);
      setIsCreating(false);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏭 Token Factory</h1>
          <p className="text-gray-600">Create your own ERC20 tokens with buyable functionality</p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}
              </span>
            </div>
            <button
              onClick={isConnected ? () => disconnect() : () => connect({ connector: injected() })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isConnected 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </div>
        </div>

        {/* Token Creation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Token</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., My Awesome Token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="e.g., MAT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Supply *
                </label>
                <input
                  type="number"
                  name="initialSupply"
                  value={formData.initialSupply}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decimals
                </label>
                <input
                  type="number"
                  name="decimals"
                  value={formData.decimals}
                  onChange={handleInputChange}
                  min="0"
                  max="18"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Token (ETH) *
                </label>
                <input
                  type="number"
                  name="pricePerToken"
                  value={formData.pricePerToken}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="e.g., 0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <button
              onClick={createToken}
              disabled={!isConnected || isPending || isConfirming || isCreating}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming || isCreating
                ? '⏳ Creating Token...'
                : '🚀 Create Token'
              }
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {error.message || 'Transaction failed'}
              </p>
            </div>
          )}
        </div>

        {/* Created Tokens List */}
        {createdTokens.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Created Tokens</h2>
            <div className="space-y-4">
              {createdTokens.map((token: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {token.name} ({token.symbol})
                    </h3>
                    <span className="text-sm text-gray-500">{token.timestamp}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Supply:</span>
                      <p className="font-medium">{token.initialSupply}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-medium">{token.pricePerToken} ETH</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Transaction:</span>
                      <p className="font-mono text-xs break-all">{token.txHash}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
            <li>Deploy your TokenFactory contract to your desired network</li>
            <li>Replace <code className="bg-yellow-100 px-1 rounded">TOKEN_FACTORY_ADDRESS</code> with your deployed contract address</li>
            <li>Configure Wagmi with your preferred networks and connectors</li>
            <li>Connect your wallet and start creating tokens!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createHash } from "crypto";
// Adjust these imports to match your actual utility locations
import { createCommercialRemixTerms, SPGNFTContractAddress } from "@/lib/story-utils";
import { client, networkInfo } from "@/lib/config";
import { uploadJSONToIPFS } from "@/lib/uploadToIpfs";
import { IpMetadata } from "@story-protocol/core-sdk";
import { Address, zeroAddress } from "viem";

// Utility to safely stringify objects with BigInt values
const safeStringify = (obj: any) =>
  JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

export default function TestIpPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [attachLoading, setAttachLoading] = useState(false);
  const [attachResult, setAttachResult] = useState<any>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      // 1. Set up your IP Metadata
      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: "Midnight Marriage",
        description: "This is a house-style song generated on suno.",
        createdAt: "1740005219",
        creators: [
          {
            name: "Jacob Tucker",
            address: "0xA2f9Cf1E40D7b03aB81e34BC50f0A8c67B4e9112",
            contributionPercent: 100,
          },
        ],
        image:
          "https://cdn2.suno.ai/image_large_8bcba6bc-3f60-4921-b148-f32a59086a4c.jpeg",
        imageHash:
          "0xc404730cdcdf7e5e54e8f16bc6687f97c6578a296f4a21b452d8a6ecabd61bcc",
        mediaUrl:
          "https://cdn1.suno.ai/dcd3076f-3aa5-400b-ba5d-87d30f27c311.mp3",
        mediaHash:
          "0xb52a44f53b2485ba772bd4857a443e1fb942cf5dda73c870e2d2238ecd607aee",
        mediaType: "audio/mpeg",
      });

      // 2. Set up your NFT Metadata
      const nftMetadata = {
        name: "Midnight Marriage",
        description:
          "This is a house-style song generated on suno. This NFT represents ownership of the IP Asset.",
        image:
          "https://cdn2.suno.ai/image_large_8bcba6bc-3f60-4921-b148-f32a59086a4c.jpeg",
        animation_url:
          "https://cdn1.suno.ai/dcd3076f-3aa5-400b-ba5d-87d30f27c311.mp3",
        attributes: [
          {
            key: "Suno Artist",
            value: "amazedneurofunk956",
          },
          {
            key: "Artist ID",
            value: "4123743b-8ba6-4028-a965-75b79a3ad424",
          },
          {
            key: "Source",
            value: "Suno.com",
          },
        ],
      };

      // 3. Upload your IP and NFT Metadata to IPFS
      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
      const ipHash = createHash("sha256")
        .update(safeStringify(ipMetadata))
        .digest("hex");
      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata);
      const nftHash = createHash("sha256")
        .update(safeStringify(nftMetadata))
        .digest("hex");

      // 4. Register the NFT as an IP Asset
      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPGNFTContractAddress,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms({
              defaultMintingFee: 1,
              commercialRevShare: 5,
            }),
          },
        ],
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          ipMetadataHash: `0x${ipHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
          nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
      });
      setResult(JSON.parse(safeStringify({
        txHash: response.txHash,
        ipId: response.ipId,
        licenseTermsIds: response.licenseTermsIds,
        explorer: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
      })));
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleAttachTerms = async () => {
    if (!result?.ipId) return;
    setAttachLoading(true);
    setAttachResult(null);
    setAttachError(null);
    try {
      // 1. Create sample license terms (non-commercial flavor)
      const licenseTerms = {
        defaultMintingFee: BigInt(0),
        currency: "0x1514000000000000000000000000000000000000" as Address, // $WIP
        royaltyPolicy: zeroAddress,
        transferable: false,
        expiration: BigInt(0),
        commercialUse: false,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x00" as `0x${string}`,
        commercialRevShare: 0,
        commercialRevCeiling: BigInt(0),
        derivativesAllowed: false,
        derivativesAttribution: false,
        derivativesApproval: false,
        derivativesReciprocal: false,
        derivativeRevCeiling: BigInt(0),
        uri: "",
      };
      // 2. Register the license terms
      const regRes = await client.license.registerPILTerms({
        ...licenseTerms,
        txOptions: { waitForTransaction: true },
      });
      // 3. Attach the license terms to the IP
      const attachRes = await client.license.attachLicenseTerms({
        licenseTermsId: String(regRes.licenseTermsId),
        ipId: result.ipId,
        txOptions: { waitForTransaction: true },
      });
      setAttachResult({
        txHash: attachRes.txHash,
        licenseTermsId: regRes.licenseTermsId,
        success: attachRes.success,
      });
    } catch (err: any) {
      setAttachError(err?.message || "Unknown error");
    } finally {
      setAttachLoading(false);
    }
  };

  const handleMintLicenseToken = async () => {
    if (!result?.ipId || !attachResult?.licenseTermsId) return;
    setMintLoading(true);
    setMintResult(null);
    setMintError(null);
    try {
      // Use a valid demo address for receiver and licensor
      const receiver = "0x000000000000000000000000000000000000dead";
      const response = await client.license.mintLicenseTokens({
        licenseTermsId: String(attachResult.licenseTermsId),
        licensorIpId: result.ipId,
        receiver,
        amount: 1,
        maxMintingFee: BigInt(0),
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true },
      });
      setMintResult({
        txHash: response.txHash,
        licenseTokenIds: response.licenseTokenIds,
      });
    } catch (err: any) {
      setMintError(err?.message || "Unknown error");
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Test IP Registration</h1>
        <Button
          className="w-full mb-4 text-black"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register IP (One Click)"}
        </Button>
        {result && (
          <>
            <div className="mt-4 text-green-700 text-sm break-words">
              <div className="font-semibold">Root IPA created:</div>
              <div>Transaction Hash: {result.txHash}</div>
              <div>IPA ID: {result.ipId}</div>
              <div>License Terms IDs: {JSON.stringify(result.licenseTermsIds)}</div>
              <a
                href={result.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline mt-2 inline-block"
              >
                View on Explorer
              </a>
            </div>
            <Button
              className="w-full mt-4 text-black"
              onClick={handleAttachTerms}
              disabled={attachLoading}
              variant="outline"
            >
              {attachLoading ? "Attaching Terms..." : "Attach License Terms (Sample)"}
            </Button>
            {attachResult && (
              <>
                <div className="mt-4 text-blue-700 text-sm break-words">
                  <div className="font-semibold">License Terms Attached:</div>
                  <div>License Terms ID: {attachResult.licenseTermsId}</div>
                  <div>Transaction Hash: {attachResult.txHash}</div>
                  <div>Status: {attachResult.success ? "Success" : "Already attached"}</div>
                </div>
                <Button
                  className="w-full mt-4 text-black"
                  onClick={handleMintLicenseToken}
                  disabled={mintLoading}
                  variant="outline"
                >
                  {mintLoading ? "Minting License Token..." : "Mint License Token"}
                </Button>
                {mintResult && (
                  <div className="mt-4 text-purple-700 text-sm break-words">
                    <div className="font-semibold">License Token Minted:</div>
                    <div>Transaction Hash: {mintResult.txHash}</div>
                    <div>License Token IDs: {safeStringify(mintResult.licenseTokenIds)}</div>
                  </div>
                )}
                {mintError && (
                  <div className="mt-4 text-red-600 text-sm break-words">{mintError}</div>
                )}
              </>
            )}
            {attachError && (
              <div className="mt-4 text-red-600 text-sm break-words">{attachError}</div>
            )}
          </>
        )}
        {error && (
          <div className="mt-4 text-red-600 text-sm break-words">{error}</div>
        )}
      </div>
    </div>
  );
} 
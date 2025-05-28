import { PinataSDK } from 'pinata-web3'

const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT, // Use NEXT_PUBLIC_ for browser env
})

// Upload JSON metadata to IPFS (browser-compatible)
export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
    const { IpfsHash } = await pinata.upload.json(jsonMetadata)
    return IpfsHash
}

// File upload to IPFS is not supported in the browser with fs/path.
// If you need to upload files from the browser, accept a File or Blob directly.
// For server-side uploads, move this logic to an API route.
// export async function uploadFileToIPFS(filePath: string, fileName: string, fileType: string): Promise<string> {
//     // This function requires Node.js modules and should be implemented server-side.
// }
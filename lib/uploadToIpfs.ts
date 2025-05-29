import { PinataSDK } from 'pinata-web3'

const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT, // Use NEXT_PUBLIC_ for browser env
})

// Upload JSON metadata to IPFS (browser-compatible)
export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
    const { IpfsHash } = await pinata.upload.json(jsonMetadata)
    return IpfsHash
}

/**
 * Get all files from Pinata (browser-compatible)
 * @returns {Promise<any[]>} List of files
 */
export async function getAllFilesFromPinata() {
    console.log(await pinata.listFiles().all())
    return await pinata.listFiles().all();
}

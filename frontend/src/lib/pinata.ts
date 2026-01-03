import axios from "axios";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const PINATA_API_URL = "https://api.pinata.cloud";
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";

/**
 * Upload JSON data to Pinata IPFS
 */
export async function uploadJSONToPinata(
  data: any,
  name: string
): Promise<string> {
  try {
    const body = {
      pinataContent: data,
      pinataMetadata: {
        name: name,
      },
    };

    const headers = PINATA_JWT
      ? {
        Authorization: `Bearer ${PINATA_JWT}`,
      }
      : {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      };

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      body,
      {
        headers,
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    throw error;
  }
}

/**
 * Upload file to Pinata IPFS
 */
export async function uploadFileToPinata(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const headers = PINATA_JWT
      ? {
        Authorization: `Bearer ${PINATA_JWT}`,
      }
      : {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      };

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers,
        maxBodyLength: Infinity,
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
}

/**
 * Get IPFS URL from hash
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
}

/**
 * Get IPFS URI (for storing on-chain)
 */
export function getIPFSUri(hash: string): string {
  return `ipfs://${hash}`;
}

/**
 * Resolve IPFS URI to HTTP URL using the configured gateway
 */
export function resolveIPFS(uri: string | undefined): string {
  if (!uri) return "";

  let gateway =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";

  if (gateway.endsWith("/")) {
    gateway = gateway.slice(0, -1);
  }

  if (!gateway.startsWith("http")) {
    gateway = `https://${gateway}`;
  }

  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", `${gateway}/ipfs/`);
  }

  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  if (uri.match(/^[a-zA-Z0-9]{46}$/) || uri.match(/^Qm[a-zA-Z0-9]{44}$/)) {
    return `${gateway}/ipfs/${uri}`;
  }

  return uri;
}

/**
 * Test Pinata connection
 */
export async function testPinataConnection(): Promise<boolean> {
  try {
    const headers = PINATA_JWT
      ? {
        Authorization: `Bearer ${PINATA_JWT}`,
      }
      : {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      };

    const response = await axios.get(
      `${PINATA_API_URL}/data/testAuthentication`,
      {
        headers,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Pinata connection test failed:", error);
    return false;
  }
}

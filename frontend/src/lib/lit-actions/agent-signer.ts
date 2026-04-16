/**
 * Lit Action: Agent Signer
 * 
 * This Lit Action verifies that the caller owns the AgentNFT before signing.
 * It checks ownership on Cronos chain and only signs if verified.
 * 
 * Parameters (passed via jsParams):
 * - agentTokenId: The AgentNFT token ID
 * - agentNFTContract: The AgentNFT contract address on Cronos
 * - callerAddress: The address requesting the signature
 * - toSign: The message/transaction hash to sign
 * - publicKey: The PKP public key
 * - chain: The chain to check ownership on (e.g., "cronos")
 */

const _litActionCode = `
const go = async () => {
  // Validate required parameters
  if (!agentTokenId || !agentNFTContract || !callerAddress || !toSign || !publicKey) {
    throw new Error('Missing required parameters');
  }

  console.log('Verifying ownership for agent:', agentTokenId);
  console.log('AgentNFT contract:', agentNFTContract);
  console.log('Caller:', callerAddress);

  // ERC721 ownerOf function selector + encoded tokenId
  // ownerOf(uint256) = 0x6352211e
  const tokenIdHex = agentTokenId.toString(16).padStart(64, '0');
  const callData = '0x6352211e' + tokenIdHex;

  console.log('Call data:', callData);

  // RPC URL for ownership verification (passed via jsParams, defaults to Cronos Testnet)
  const rpcUrl = verificationRpcUrl || 'https://evm-t3.cronos.org';

  // Make direct RPC call using fetch
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{
        to: agentNFTContract,
        data: callData,
      }, 'latest'],
      id: 1,
    }),
  });

  const data = await response.json();
  console.log('RPC response:', JSON.stringify(data));

  if (data.error) {
    throw new Error('RPC error: ' + JSON.stringify(data.error));
  }

  // Decode the owner address from the response (response is 32 bytes, last 20 bytes is address)
  const rawResult = data.result;
  const decodedOwner = '0x' + rawResult.slice(-40);
  
  console.log('AgentNFT owner:', decodedOwner);
  console.log('Caller address:', callerAddress);

  // Verify the caller owns the AgentNFT
  if (decodedOwner.toLowerCase() !== callerAddress.toLowerCase()) {
    throw new Error('Caller does not own this agent. Owner: ' + decodedOwner + ', Caller: ' + callerAddress);
  }

  console.log('Ownership verified! Signing...');

  // Sign the message/transaction
  const sigShare = await Lit.Actions.signEcdsa({
    toSign,
    publicKey,
    sigName: 'agentSignature',
  });
};

go();
`;

// Export the Lit Action code as a string
export const AGENT_SIGNER_LIT_ACTION = _litActionCode;

// Helper to get the Lit Action code with inline parameters for testing
export function getAgentSignerLitAction(): string {
  return _litActionCode;
}

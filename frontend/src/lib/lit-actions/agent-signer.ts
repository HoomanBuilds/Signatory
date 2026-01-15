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

  // ERC721 ownerOf function signature
  const ownerOfAbi = [{
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }];

  // Check who owns the AgentNFT
  const owner = await Lit.Actions.callContract({
    chain: chain || "cronos",
    txn: ethers.utils.hexlify(
      new ethers.utils.Interface(ownerOfAbi).encodeFunctionData('ownerOf', [agentTokenId])
    ),
    contractAddress: agentNFTContract,
  });

  // Decode the owner address from the response
  const decodedOwner = ethers.utils.defaultAbiCoder.decode(['address'], owner)[0];
  
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

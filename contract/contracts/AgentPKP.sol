// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IAgentNFT
 * @dev Interface for AgentNFT contract
 */
interface IAgentNFT {
    function exists(uint256 tokenId) external view returns (bool);
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title AgentPKP
 * @dev Registry linking AgentNFT tokens to Lit Protocol PKP wallets
 */
contract AgentPKP is Ownable {
    IAgentNFT public agentNFT;
    
    mapping(uint256 => bytes) public pkpPublicKey;
    mapping(uint256 => address) public evmAddress;
    mapping(uint256 => mapping(string => string)) public chainAddresses;
    mapping(uint256 => bytes32) public pkpTokenId;
    mapping(address => uint256) public walletToAgent;
    uint256 public totalRegistered;
    
    // Events
    event PKPRegistered(
        uint256 indexed agentTokenId,
        address indexed evmAddress,
        bytes pkpPublicKey,
        bytes32 pkpTokenId
    );
    
    event ChainAddressSet(
        uint256 indexed agentTokenId,
        string chainId,
        string chainAddress
    );
    
    event PKPUpdated(
        uint256 indexed agentTokenId,
        address indexed oldWallet,
        address indexed newWallet
    );
    
    event AgentNFTUpdated(address indexed newAgentNFT);
    
    constructor(address _agentNFT) Ownable(msg.sender) {
        require(_agentNFT != address(0), "Invalid AgentNFT address");
        agentNFT = IAgentNFT(_agentNFT);
    }
    
    /**
     * @dev Register PKP for an agent (only backend/owner can call)
     * Called after backend mints PKP on Lit Protocol
     * @param agentTokenId The AgentNFT token ID
     * @param _pkpPublicKey The 65-byte uncompressed PKP public key
     * @param _evmAddress The derived Ethereum address (same for all EVM chains)
     * @param _pkpTokenId The PKP token ID from Lit Protocol
     */
    function registerPKP(
        uint256 agentTokenId,
        bytes calldata _pkpPublicKey,
        address _evmAddress,
        bytes32 _pkpTokenId
    ) external onlyOwner {
        require(agentNFT.exists(agentTokenId), "Agent does not exist");
        require(_evmAddress != address(0), "Invalid wallet address");
        require(_pkpPublicKey.length == 65, "Invalid PKP public key length");
        require(pkpPublicKey[agentTokenId].length == 0, "PKP already registered");
        require(walletToAgent[_evmAddress] == 0, "Wallet already registered");
        
        pkpPublicKey[agentTokenId] = _pkpPublicKey;
        evmAddress[agentTokenId] = _evmAddress;
        pkpTokenId[agentTokenId] = _pkpTokenId;
        walletToAgent[_evmAddress] = agentTokenId;
        totalRegistered++;
        
        emit PKPRegistered(agentTokenId, _evmAddress, _pkpPublicKey, _pkpTokenId);
    }
    
    /**
     * @dev Update PKP for an agent (for recovery/migration)
     * @param agentTokenId The AgentNFT token ID
     * @param _newPkpPublicKey The new PKP public key
     * @param _newEvmAddress The new derived wallet address
     * @param _newPkpTokenId The new PKP token ID
     */
    function updatePKP(
        uint256 agentTokenId,
        bytes calldata _newPkpPublicKey,
        address _newEvmAddress,
        bytes32 _newPkpTokenId
    ) external onlyOwner {
        require(pkpPublicKey[agentTokenId].length > 0, "PKP not registered");
        require(_newEvmAddress != address(0), "Invalid wallet address");
        require(_newPkpPublicKey.length == 65, "Invalid PKP public key length");
        
        address oldWallet = evmAddress[agentTokenId];
        
        // Clear old reverse lookup
        delete walletToAgent[oldWallet];
        
        // Set new values
        pkpPublicKey[agentTokenId] = _newPkpPublicKey;
        evmAddress[agentTokenId] = _newEvmAddress;
        pkpTokenId[agentTokenId] = _newPkpTokenId;
        walletToAgent[_newEvmAddress] = agentTokenId;
        
        emit PKPUpdated(agentTokenId, oldWallet, _newEvmAddress);
    }
    
    /**
     * @dev Set chain-specific address for an agent (Solana, Aptos, etc.)
     * @param agentTokenId The AgentNFT token ID
     * @param chainId The chain identifier (e.g., "solana", "aptos")
     * @param _address The address on that chain (as string due to different formats)
     */
    function setChainAddress(
        uint256 agentTokenId,
        string calldata chainId,
        string calldata _address
    ) external onlyOwner {
        require(pkpPublicKey[agentTokenId].length > 0, "PKP not registered");
        require(bytes(_address).length > 0, "Invalid address");
        
        chainAddresses[agentTokenId][chainId] = _address;
        emit ChainAddressSet(agentTokenId, chainId, _address);
    }
    
    /**
     * @dev Get chain-specific address for an agent
     * @param agentTokenId The AgentNFT token ID
     * @param chainId The chain identifier
     */
    function getChainAddress(
        uint256 agentTokenId,
        string calldata chainId
    ) external view returns (string memory) {
        return chainAddresses[agentTokenId][chainId];
    }
    
    /**
     * @dev Get EVM wallet address for an agent (same for all EVM chains)
     */
    function getAgentWallet(uint256 agentTokenId) external view returns (address) {
        return evmAddress[agentTokenId];
    }
    
    /**
     * @dev Get PKP public key for an agent
     */
    function getAgentPKP(uint256 agentTokenId) external view returns (bytes memory) {
        return pkpPublicKey[agentTokenId];
    }
    
    /**
     * @dev Check if agent has a registered PKP
     */
    function hasPKP(uint256 agentTokenId) external view returns (bool) {
        return pkpPublicKey[agentTokenId].length > 0;
    }
    
    /**
     * @dev Get agent token ID from wallet address
     */
    function getAgentByWallet(address wallet) external view returns (uint256) {
        return walletToAgent[wallet];
    }
    
    /**
     * @dev Get full PKP info for an agent
     */
    function getPKPInfo(uint256 agentTokenId) external view returns (
        bytes memory _pkpPublicKey,
        address _evmAddress,
        bytes32 _pkpTokenId,
        address agentOwner
    ) {
        _pkpPublicKey = pkpPublicKey[agentTokenId];
        _evmAddress = evmAddress[agentTokenId];
        _pkpTokenId = pkpTokenId[agentTokenId];
        
        if (agentNFT.exists(agentTokenId)) {
            agentOwner = agentNFT.ownerOf(agentTokenId);
        }
    }
    
    /**
     * @dev Get multiple chain addresses for an agent
     * @param agentTokenId The AgentNFT token ID  
     * @param chainIds Array of chain identifiers to query
     * @return addresses Array of addresses for each chain
     */
    function getChainAddresses(
        uint256 agentTokenId,
        string[] calldata chainIds
    ) external view returns (string[] memory addresses) {
        addresses = new string[](chainIds.length);
        for (uint256 i = 0; i < chainIds.length; i++) {
            addresses[i] = chainAddresses[agentTokenId][chainIds[i]];
        }
    }
    
    /**
     * @dev Update AgentNFT contract reference (in case of upgrade)
     */
    function setAgentNFT(address _agentNFT) external onlyOwner {
        require(_agentNFT != address(0), "Invalid AgentNFT address");
        agentNFT = IAgentNFT(_agentNFT);
        emit AgentNFTUpdated(_agentNFT);
    }
}

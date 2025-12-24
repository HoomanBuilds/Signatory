// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentNFT
 * @dev ERC721 contract for AI Agent NFTs with personality traits
 */
contract AgentNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;

    // Minting fee
    uint256 public mintingFee = 0.01 ether;
    uint256 public constant MAX_LEADERBOARD_LIMIT = 100; 

    // Agent metadata
    struct AgentMetadata {
        string name;
        string personalityHash; 
        uint256 createdAt;
        address creator;
        uint256 chatCount;
        uint256 level;
    }

    // Token ID => Agent Metadata
    mapping(uint256 => AgentMetadata) public agentMetadata;

    // Creator => Token IDs
    mapping(address => uint256[]) public creatorAgents;

    // Token ID => Is Public 
    mapping(uint256 => bool) public agentIsPublic;

    // Events
    event AgentMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string personalityHash
    );

    event AgentLevelUp(uint256 indexed tokenId, uint256 newLevel);
    event ChatRecorded(uint256 indexed tokenId, uint256 totalChats);
    event MintingFeeUpdated(uint256 newFee);
    event AgentVisibilityChanged(uint256 indexed tokenId, bool isPublic);

    constructor() ERC721("AI Agent NFT", "AGENT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new AI Agent NFT
     * @param name Agent name
     * @param tokenURI IPFS URI with personality JSON
     * @param personalityHash IPFS hash for quick reference
     */
    function mintAgent(
        string memory name,
        string memory tokenURI,
        string memory personalityHash
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");

        uint256 tokenId = _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        agentMetadata[tokenId] = AgentMetadata({
            name: name,
            personalityHash: personalityHash,
            createdAt: block.timestamp,
            creator: msg.sender,
            chatCount: 0,
            level: 1
        });

        creatorAgents[msg.sender].push(tokenId);

        // Default to public (anyone can chat)
        agentIsPublic[tokenId] = true;

        emit AgentMinted(tokenId, msg.sender, name, personalityHash);

        return tokenId;
    }

    

    /**
     * @dev Record a chat interaction (only backend can call)
     */
    function recordChat(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");

        agentMetadata[tokenId].chatCount++;

        // Auto level-up every 100 chats
        if (agentMetadata[tokenId].chatCount % 100 == 0) {
            agentMetadata[tokenId].level++;
            emit AgentLevelUp(tokenId, agentMetadata[tokenId].level);
        }

        emit ChatRecorded(tokenId, agentMetadata[tokenId].chatCount);
    }

    /**
     * @dev Get all agents owned by an address
     */
    function getAgentsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;

        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
                if (index == balance) break; // Optimization
            }
        }

        return tokens;
    }

    /**
     * @dev Get agents created by an address
     */
    function getAgentsByCreator(address creator) external view returns (uint256[] memory) {
        return creatorAgents[creator];
    }

    /**
     * @dev Get agent metadata
     */
    function getAgentMetadata(uint256 tokenId) external view returns (AgentMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agentMetadata[tokenId];
    }

    /**
     * @dev Update minting fee (only owner)
     */
    function setMintingFee(uint256 newFee) external onlyOwner {
        mintingFee = newFee;
        emit MintingFeeUpdated(newFee);
    }

    
    /**
     * @dev Get total minted agents
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Get next token ID that will be minted
     */
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Burn an agent (owner only)
     */
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _burn(tokenId);
    }

    /**
     * @dev Check if a token exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Set agent visibility (public or private)
     * Only the agent owner can change this
     */
    function setAgentPublic(uint256 tokenId, bool _isPublic) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");
        agentIsPublic[tokenId] = _isPublic;
        emit AgentVisibilityChanged(tokenId, _isPublic);
    }

    /**
     * @dev Get agent visibility
     */
    function getAgentVisibility(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agentIsPublic[tokenId];
    }

    /**
     * @dev Get top agents by chat count
     * @param limit Maximum number of agents to return
     * @return tokenIds Array of token IDs (sorted by chat count, descending)
     * @return chatCounts Array of corresponding chat counts
     * @return names Array of agent names
     */
    function getTopAgentsByChats(uint256 limit) external view returns (
        uint256[] memory tokenIds,
        uint256[] memory chatCounts,
        string[] memory names
    ) {
        uint256 cappedLimit = limit > MAX_LEADERBOARD_LIMIT ? MAX_LEADERBOARD_LIMIT : limit;
        uint256 totalAgents = _nextTokenId - 1;
        if (totalAgents == 0) {
            return (new uint256[](0), new uint256[](0), new string[](0));
        }
        
        uint256 count = totalAgents < cappedLimit ? totalAgents : cappedLimit;
        
        // Create temporary arrays for sorting (only existing agents)
        uint256 existingCount = 0;
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) != address(0)) {
                existingCount++;
            }
        }
        
        uint256[] memory tempIds = new uint256[](existingCount);
        uint256[] memory tempChats = new uint256[](existingCount);
        uint256 idx = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) != address(0)) {
                tempIds[idx] = i;
                tempChats[idx] = agentMetadata[i].chatCount;
                idx++;
            }
        }
        
        // Simple bubble sort (descending by chat count)
        for (uint256 i = 0; i < existingCount; i++) {
            for (uint256 j = i + 1; j < existingCount; j++) {
                if (tempChats[j] > tempChats[i]) {
                    // Swap
                    uint256 tempChat = tempChats[i];
                    tempChats[i] = tempChats[j];
                    tempChats[j] = tempChat;
                    uint256 tempId = tempIds[i];
                    tempIds[i] = tempIds[j];
                    tempIds[j] = tempId;
                }
            }
        }
        
        // Return top 'limit' results
        count = existingCount < limit ? existingCount : limit;
        tokenIds = new uint256[](count);
        chatCounts = new uint256[](count);
        names = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempIds[i];
            chatCounts[i] = tempChats[i];
            names[i] = agentMetadata[tempIds[i]].name;
        }
        
        return (tokenIds, chatCounts, names);
    }

    /**
     * @dev Get agents with their chat counts (paginated)
     * @param offset Starting index
     * @param limit Number of agents to return
     * @return tokenIds Array of token IDs
     * @return chatCounts Array of chat counts
     */
    function getAgentsWithChatCounts(uint256 offset, uint256 limit) external view returns (
        uint256[] memory tokenIds,
        uint256[] memory chatCounts
    ) {
        uint256 totalAgents = _nextTokenId - 1;
        if (offset >= totalAgents) {
            return (new uint256[](0), new uint256[](0));
        }
        
        uint256 end = offset + limit;
        if (end > totalAgents) {
            end = totalAgents;
        }
        
        uint256 resultSize = end - offset;
        tokenIds = new uint256[](resultSize);
        chatCounts = new uint256[](resultSize);
        
        uint256 resultIdx = 0;
        uint256 currentIdx = 0;
        
        for (uint256 i = 1; i < _nextTokenId && resultIdx < resultSize; i++) {
            if (_ownerOf(i) != address(0)) {
                if (currentIdx >= offset) {
                    tokenIds[resultIdx] = i;
                    chatCounts[resultIdx] = agentMetadata[i].chatCount;
                    resultIdx++;
                }
                currentIdx++;
            }
        }
        
        return (tokenIds, chatCounts);
    }
}

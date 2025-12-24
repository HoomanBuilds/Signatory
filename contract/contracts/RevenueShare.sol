// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RevenueShare
 * @dev Manages revenue distribution for AI Agent-generated content
 */
contract RevenueShare is ReentrancyGuard, Ownable {
    // Revenue split percentages (in basis points)
    uint256 public agentOwnerShare = 8000; // 80%
    uint256 public platformShare = 2000; // 20%
    uint256 public constant FEE_DENOMINATOR = 10000;

    IERC721 public agentNFT;

    // Token ID => Total earnings
    mapping(uint256 => uint256) public agentEarnings;

    // Token ID => Owner => Claimable amount
    mapping(uint256 => mapping(address => uint256)) public claimableEarnings;

    // Token ID => Withdrawn amount
    mapping(uint256 => uint256) public withdrawnEarnings;

    // Token ID => Agent Wallet Address
    mapping(uint256 => address) public agentWallets;

    // Platform accumulated earnings
    uint256 public platformEarnings;
    uint256 public platformWithdrawn;

    enum RevenueSource {
        ContentSale, // Agent-created content sold as NFT
        Marketplace, // Secondary marketplace sales
        Custom // Other revenue streams
    }

    struct RevenueRecord {
        uint256 tokenId;
        uint256 amount;
        address payer;
        RevenueSource source;
        uint256 timestamp;
    }

    RevenueRecord[] public revenueHistory;
    uint256 public constant MAX_HISTORY_SIZE = 10000; 

    // Events
    event RevenueReceived(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed payer,
        RevenueSource source,
        uint256 timestamp
    );

    event EarningsClaimed(uint256 indexed tokenId, address indexed owner, uint256 amount);

    event PlatformEarningsWithdrawn(uint256 amount);
    event RevenueSplitUpdated(uint256 agentShare, uint256 platformShare);

    event AgentWalletUpdated(uint256 indexed tokenId, address wallet);
    event AgentNFTUpdated(address newAgentNFT);

    constructor(address _agentNFT) Ownable(msg.sender) {
        require(_agentNFT != address(0), "Invalid NFT address");
        agentNFT = IERC721(_agentNFT);
    }

    /**
     * @dev Update the AgentNFT contract address (only owner)
     */
    function setAgentNFT(address _agentNFT) external onlyOwner {
        require(_agentNFT != address(0), "Invalid NFT address");
        agentNFT = IERC721(_agentNFT);
        emit AgentNFTUpdated(_agentNFT);
    }

    /**
     * @dev Set the wallet address for an agent (where revenue will be sent)
     */
    function setAgentWallet(uint256 tokenId, address wallet) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        agentWallets[tokenId] = wallet;
        emit AgentWalletUpdated(tokenId, wallet);
    }

    /**
     * @dev Record revenue for an agent
     */
    function recordRevenue(uint256 tokenId, RevenueSource source) external payable nonReentrant {
        require(msg.value > 0, "No payment sent");
        require(_exists(tokenId), "Agent does not exist");

        // Calculate splits
        uint256 ownerAmount = (msg.value * agentOwnerShare) / FEE_DENOMINATOR;
        uint256 platformAmount = msg.value - ownerAmount;

        // Determine recipient: Agent Wallet (if set) or NFT Owner
        address recipient = agentWallets[tokenId];
        if (recipient == address(0)) {
            recipient = agentNFT.ownerOf(tokenId);
        }

        // Effects
        agentEarnings[tokenId] += ownerAmount;
        platformEarnings += platformAmount;

        // Interactions: Auto-send to Agent/Owner
        (bool success, ) = payable(recipient).call{value: ownerAmount}("");
        require(success, "Transfer to agent failed");

        // Record in history (with size limit to prevent unbounded growth)
        if (revenueHistory.length < MAX_HISTORY_SIZE) {
            revenueHistory.push(
                RevenueRecord({
                    tokenId: tokenId,
                    amount: msg.value,
                    payer: msg.sender,
                    source: source,
                    timestamp: block.timestamp
                })
            );
        }

        emit RevenueReceived(tokenId, msg.value, msg.sender, source, block.timestamp);
    }

    /**
     * @dev Claim earnings for a specific agent
     */
    function claimEarnings(uint256 tokenId) external nonReentrant {
        uint256 claimable = claimableEarnings[tokenId][msg.sender];
        require(claimable > 0, "No earnings to claim");

        claimableEarnings[tokenId][msg.sender] = 0;
        withdrawnEarnings[tokenId] += claimable;

        (bool success, ) = payable(msg.sender).call{value: claimable}("");
        require(success, "Transfer failed");

        emit EarningsClaimed(tokenId, msg.sender, claimable);
    }

    /**
     * @dev Batch claim earnings for multiple agents
     */
    function batchClaimEarnings(uint256[] calldata tokenIds) external nonReentrant {
        uint256 totalClaimable = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 claimable = claimableEarnings[tokenIds[i]][msg.sender];

            if (claimable > 0) {
                claimableEarnings[tokenIds[i]][msg.sender] = 0;
                withdrawnEarnings[tokenIds[i]] += claimable;
                totalClaimable += claimable;

                emit EarningsClaimed(tokenIds[i], msg.sender, claimable);
            }
        }

        require(totalClaimable > 0, "No earnings to claim");

        (bool success, ) = payable(msg.sender).call{value: totalClaimable}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Get claimable earnings for specific agents owned by user
     * @param user The address to check
     * @param tokenIds Array of token IDs to check
     * @return total Total claimable amount across provided tokens
     */
    function getTotalClaimableEarnings(
        address user,
        uint256[] calldata tokenIds
    ) external view returns (uint256 total) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            total += claimableEarnings[tokenIds[i]][user];
        }
        return total;
    }

    /**
     * @dev Get claimable earnings for a specific agent and owner
     */
    function getClaimableEarnings(uint256 tokenId, address owner) external view returns (uint256) {
        return claimableEarnings[tokenId][owner];
    }

    /**
     * @dev Get agent earnings statistics
     */
    function getAgentStats(
        uint256 tokenId
    ) external view returns (uint256 totalEarnings, uint256 withdrawn, uint256 pending) {
        address currentOwner = agentNFT.ownerOf(tokenId);

        return (
            agentEarnings[tokenId],
            withdrawnEarnings[tokenId],
            claimableEarnings[tokenId][currentOwner]
        );
    }

    /**
     * @dev Get revenue history for an agent
     */
    function getAgentRevenueHistory(
        uint256 tokenId,
        uint256 limit
    ) external view returns (RevenueRecord[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < revenueHistory.length; i++) {
            if (revenueHistory[i].tokenId == tokenId) {
                count++;
                if (count >= limit) break;
            }
        }

        // Build result array
        RevenueRecord[] memory records = new RevenueRecord[](count);
        uint256 index = 0;

        for (uint256 i = revenueHistory.length; i > 0 && index < count; i--) {
            if (revenueHistory[i - 1].tokenId == tokenId) {
                records[index] = revenueHistory[i - 1];
                index++;
            }
        }

        return records;
    }

    /**
     * @dev Withdraw platform earnings (only owner)
     */
    function withdrawPlatformEarnings() external onlyOwner nonReentrant {
        uint256 available = platformEarnings - platformWithdrawn;
        require(available > 0, "No earnings to withdraw");

        platformWithdrawn += available;

        (bool success, ) = payable(owner()).call{value: available}("");
        require(success, "Transfer failed");

        emit PlatformEarningsWithdrawn(available);
    }

    /**
     * @dev Update revenue split (only owner)
     */
    function updateRevenueSplit(
        uint256 newAgentShare,
        uint256 newPlatformShare
    ) external onlyOwner {
        require(newAgentShare + newPlatformShare == FEE_DENOMINATOR, "Shares must sum to 100%");
        require(newAgentShare >= 5000, "Agent share must be at least 50%");

        agentOwnerShare = newAgentShare;
        platformShare = newPlatformShare;

        emit RevenueSplitUpdated(newAgentShare, newPlatformShare);
    }

    /**
     * @dev Get platform earnings statistics
     */
    function getPlatformStats()
        external
        view
        returns (uint256 totalEarnings, uint256 withdrawn, uint256 available)
    {
        return (platformEarnings, platformWithdrawn, platformEarnings - platformWithdrawn);
    }

    /**
     * @dev Check if agent exists
     */
    function _exists(uint256 tokenId) private view returns (bool) {
        try agentNFT.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get total revenue history count
     */
    function getRevenueHistoryCount() external view returns (uint256) {
        return revenueHistory.length;
    }
}

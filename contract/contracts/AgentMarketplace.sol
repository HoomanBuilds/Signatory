// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentMarketplace
 * @dev Marketplace for buying and selling AI Agent NFTs
 */
contract AgentMarketplace is ReentrancyGuard, Ownable {
    // Marketplace fee 
    uint256 public marketplaceFee = 500; // 5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_LEADERBOARD_LIMIT = 100;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    // NFT Contract => Token ID => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Track marketplace stats
    uint256 public totalListings;
    uint256 public totalSales;
    uint256 public totalVolume;

    // Top seller tracking
    mapping(address => uint256) public userSalesCount;
    mapping(address => uint256) public userSalesVolume;
    address[] public allSellers;
    mapping(address => bool) private isSellerTracked;

    // Events
    event AgentListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event AgentSold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );

    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller
    );

    event PriceUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    event MarketplaceFeeUpdated(uint256 newFee);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev List an agent for sale
     */
    function listAgent(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        require(!listings[nftContract][tokenId].active, "Already listed");

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        totalListings++;

        emit AgentListed(nftContract, tokenId, msg.sender, price);
    }

    /**
     * @dev Buy a listed agent
     */
    function buyAgent(address nftContract, uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];

        require(listing.active, "Agent not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own agent");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == listing.seller, "Seller no longer owns agent");

        // Calculate fees
        uint256 fee = (listing.price * marketplaceFee) / FEE_DENOMINATOR;
        uint256 sellerProceeds = listing.price - fee;

        listings[nftContract][tokenId].active = false;

        nft.safeTransferFrom(listing.seller, msg.sender, tokenId);

        (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(sellerSuccess, "Seller payment failed");

        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }

        totalSales++;
        totalVolume += listing.price;

        // Track seller stats
        userSalesCount[listing.seller]++;
        userSalesVolume[listing.seller] += listing.price;
        if (!isSellerTracked[listing.seller]) {
            allSellers.push(listing.seller);
            isSellerTracked[listing.seller] = true;
        }

        emit AgentSold(nftContract, tokenId, listing.seller, msg.sender, listing.price);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(address nftContract, uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];

        require(listing.active, "Agent not listed");
        require(listing.seller == msg.sender, "Not the seller");

        listings[nftContract][tokenId].active = false;

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    /**
     * @dev Update listing price
     */
    function updatePrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];

        require(listing.active, "Agent not listed");
        require(listing.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be greater than 0");

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit PriceUpdated(nftContract, tokenId, oldPrice, newPrice);
    }

    /**
     * @dev Get listing details
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }

    /**
     * @dev Check if an agent is listed
     */
    function isListed(address nftContract, uint256 tokenId) external view returns (bool) {
        return listings[nftContract][tokenId].active;
    }

    /**
     * @dev Update marketplace fee (only owner)
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats()
        external
        view
        returns (
            uint256 _totalListings,
            uint256 _totalSales,
            uint256 _totalVolume,
            uint256 _marketplaceFee
        )
    {
        return (totalListings, totalSales, totalVolume, marketplaceFee);
    }

    /**
     * @dev Admin function to clear orphaned listings (e.g., from old NFT contracts)
     * Only owner can call this
     */
    function adminClearListing(address nftContract, uint256 tokenId) external onlyOwner {
        require(listings[nftContract][tokenId].active, "Listing not active");
        
        delete listings[nftContract][tokenId];
        
        emit ListingCancelled(nftContract, tokenId, address(0));
    }

    /**
     * @dev Get user's sales statistics
     * @param user The address to check
     * @return salesCount Number of NFTs sold
     * @return salesVolume Total volume in wei
     */
    function getUserSalesStats(address user) external view returns (uint256 salesCount, uint256 salesVolume) {
        return (userSalesCount[user], userSalesVolume[user]);
    }

    /**
     * @dev Get top sellers by number of sales
     * @param limit Maximum number of sellers to return
     * @return sellers Array of seller addresses (sorted by sales count, descending)
     * @return salesCounts Array of corresponding sales counts
     */
    function getTopSellersBySalesCount(uint256 limit) external view returns (address[] memory sellers, uint256[] memory salesCounts) {
        uint256 cappedLimit = limit > MAX_LEADERBOARD_LIMIT ? MAX_LEADERBOARD_LIMIT : limit;
        uint256 count = allSellers.length < cappedLimit ? allSellers.length : cappedLimit;
        
        // Create temporary arrays for sorting
        address[] memory tempSellers = new address[](allSellers.length);
        uint256[] memory tempCounts = new uint256[](allSellers.length);
        
        for (uint256 i = 0; i < allSellers.length; i++) {
            tempSellers[i] = allSellers[i];
            tempCounts[i] = userSalesCount[allSellers[i]];
        }
        
        // Simple bubble sort (gas efficient for small arrays)
        for (uint256 i = 0; i < allSellers.length; i++) {
            for (uint256 j = i + 1; j < allSellers.length; j++) {
                if (tempCounts[j] > tempCounts[i]) {
                    // Swap counts
                    uint256 tempCount = tempCounts[i];
                    tempCounts[i] = tempCounts[j];
                    tempCounts[j] = tempCount;
                    // Swap addresses
                    address tempAddr = tempSellers[i];
                    tempSellers[i] = tempSellers[j];
                    tempSellers[j] = tempAddr;
                }
            }
        }
        
        // Return top 'limit' results
        sellers = new address[](count);
        salesCounts = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            sellers[i] = tempSellers[i];
            salesCounts[i] = tempCounts[i];
        }
        
        return (sellers, salesCounts);
    }

    /**
     * @dev Get top sellers by sales volume
     * @param limit Maximum number of sellers to return
     * @return sellers Array of seller addresses (sorted by volume, descending)
     * @return volumes Array of corresponding sales volumes in wei
     */
    function getTopSellersByVolume(uint256 limit) external view returns (address[] memory sellers, uint256[] memory volumes) {
        uint256 cappedLimit = limit > MAX_LEADERBOARD_LIMIT ? MAX_LEADERBOARD_LIMIT : limit;
        uint256 count = allSellers.length < cappedLimit ? allSellers.length : cappedLimit;
        
        // Create temporary arrays for sorting
        address[] memory tempSellers = new address[](allSellers.length);
        uint256[] memory tempVolumes = new uint256[](allSellers.length);
        
        for (uint256 i = 0; i < allSellers.length; i++) {
            tempSellers[i] = allSellers[i];
            tempVolumes[i] = userSalesVolume[allSellers[i]];
        }
        
        // Simple bubble sort
        for (uint256 i = 0; i < allSellers.length; i++) {
            for (uint256 j = i + 1; j < allSellers.length; j++) {
                if (tempVolumes[j] > tempVolumes[i]) {
                    uint256 tempVol = tempVolumes[i];
                    tempVolumes[i] = tempVolumes[j];
                    tempVolumes[j] = tempVol;
                    address tempAddr = tempSellers[i];
                    tempSellers[i] = tempSellers[j];
                    tempSellers[j] = tempAddr;
                }
            }
        }
        
        sellers = new address[](count);
        volumes = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            sellers[i] = tempSellers[i];
            volumes[i] = tempVolumes[i];
        }
        
        return (sellers, volumes);
    }

    /**
     * @dev Get total number of unique sellers
     */
    function getTotalSellersCount() external view returns (uint256) {
        return allSellers.length;
    }
}

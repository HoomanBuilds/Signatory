// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentCredits
 * @dev ERC20 token for AI Agent chat credits system
 */
contract AgentCredits is ERC20, Ownable, ReentrancyGuard {
    uint256 public creditPrice = 0.0001 ether; // Price per credit
    address public revenueShareContract;


    // Credit purchase plans
    struct CreditPlan {
        uint256 credits;
        uint256 price;
        uint256 discountPercent;
        bool active;
    }

    mapping(uint256 => CreditPlan) public plans;
    uint256 public planCount;

    // User => NFT Contract => Agent ID => Session Credits
    mapping(address => mapping(address => mapping(uint256 => uint256))) public sessionCredits;

    // Free tier
    uint256 public freeTierCredits = 10;
    mapping(address => bool) public hasClaimedFreeTier;

    // Backend service address (authorized to spend credits)
    mapping(address => bool) public authorizedSpenders;

    // Events
    event CreditsPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event CreditsSpent(address indexed user, uint256 amount, string reason);
    event PlanPurchased(
        address indexed buyer,
        uint256 indexed planId,
        uint256 credits,
        uint256 cost
    );
    event FreeTierClaimed(address indexed user, uint256 amount);
    event PlanCreated(
        uint256 indexed planId,
        uint256 credits,
        uint256 price,
        uint256 discountPercent
    );
    event PlanStatusUpdated(uint256 indexed planId, bool active);
    event CreditPriceUpdated(uint256 newPrice);
    event FreeTierCreditsUpdated(uint256 newAmount);
    event AuthorizedSpenderUpdated(address indexed spender, bool authorized);

    event SessionPurchased(address indexed user, address indexed nftContract, uint256 indexed agentId, uint256 amount, uint256 cost);
    event SessionCreditUsed(address indexed user, address indexed nftContract, uint256 indexed agentId);

    constructor() ERC20("Agent Credits", "ACRED") Ownable(msg.sender) {
        // Plan 0: 100 credits = 0.009 ETH (10% discount, normally 0.01 ETH)
        _createPlan(100, 0.009 ether, 10);

        // Plan 1: 500 credits = 0.04 ETH (20% discount, normally 0.05 ETH)
        _createPlan(500, 0.04 ether, 20);

        // Plan 2: 1000 credits = 0.07 ETH (30% discount, normally 0.1 ETH)
        _createPlan(1000, 0.07 ether, 30);
    }

    /**
     * @dev Purchase credits with ETH
     */
    function purchaseCredits(uint256 amount) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        uint256 cost = amount * creditPrice;
        require(msg.value >= cost, "Insufficient payment");

        _mint(msg.sender, amount);

        if (msg.value > cost) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(refundSuccess, "Refund failed");
        }

        emit CreditsPurchased(msg.sender, amount, cost);
    }

    /**
     * @dev Purchase a credit plan (bulk purchase with discount)
     */
    function purchasePlan(uint256 planId) external payable nonReentrant {
        require(planId < planCount, "Invalid plan ID");

        CreditPlan memory plan = plans[planId];
        require(plan.active, "Plan is not active");
        require(msg.value >= plan.price, "Insufficient payment");

        _mint(msg.sender, plan.credits);

        if (msg.value > plan.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - plan.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit PlanPurchased(msg.sender, planId, plan.credits, plan.price);
    }

    /**
     * @dev Claim free tier credits (once per user)
     */
    function claimFreeTier() external {
        require(!hasClaimedFreeTier[msg.sender], "Free tier already claimed");

        hasClaimedFreeTier[msg.sender] = true;
        _mint(msg.sender, freeTierCredits);

        emit FreeTierClaimed(msg.sender, freeTierCredits);
    }

    /**
     * @dev Spend credits (only authorized spenders - backend service)
     */
    function spendCredits(address user, uint256 amount, string calldata reason) external {
        require(authorizedSpenders[msg.sender], "Not authorized to spend credits");
        require(balanceOf(user) >= amount, "Insufficient credits");

        _burn(user, amount);

        emit CreditsSpent(user, amount, reason);
    }

    /**
     * @dev Get user's credit balance
     */
    function getUserCredits(address user) external view returns (uint256) {
        return balanceOf(user);
    }

    /**
     * @dev Create a new subscription plan (only owner)
     */
    function createPlan(
        uint256 credits,
        uint256 price,
        uint256 discountPercent
    ) external onlyOwner {
        _createPlan(credits, price, discountPercent);
    }

    function _createPlan(uint256 credits, uint256 price, uint256 discountPercent) private {
        plans[planCount] = CreditPlan({
            credits: credits,
            price: price,
            discountPercent: discountPercent,
            active: true
        });

        emit PlanCreated(planCount, credits, price, discountPercent);
        planCount++;
    }

    /**
     * @dev Update plan status (only owner)
     */
    function updatePlanStatus(uint256 planId, bool active) external onlyOwner {
        require(planId < planCount, "Invalid plan ID");
        plans[planId].active = active;
        emit PlanStatusUpdated(planId, active);
    }


    /**
     * @dev Purchase a session pack (50 credits) for an agent
     * Forwards payment to RevenueShare contract
     * @param nftContract The NFT contract address
     * @param agentId The agent token ID
     */
    function purchaseSession(address nftContract, uint256 agentId) external payable nonReentrant {
        require(nftContract != address(0), "Invalid NFT contract");
        require(msg.value >= 0.005 ether, "Insufficient payment (0.005 ETH required)");
        require(revenueShareContract != address(0), "RevenueShare contract not set");

        // Grant 50 credits
        sessionCredits[msg.sender][nftContract][agentId] += 50;

        // Forward payment to RevenueShare
        (bool success, ) = revenueShareContract.call{value: msg.value}(
            abi.encodeWithSignature("recordRevenue(uint256,uint8)", agentId, 0)
        );
        require(success, "Revenue forwarding failed");

        emit SessionPurchased(msg.sender, nftContract, agentId, 50, msg.value);
    }

    /**
     * @dev Use a session credit (only authorized spenders - backend service)
     * @param user The user address
     * @param nftContract The NFT contract address
     * @param agentId The agent token ID
     */
    function useSessionCredit(address user, address nftContract, uint256 agentId) external {
        require(authorizedSpenders[msg.sender], "Not authorized");
        require(sessionCredits[user][nftContract][agentId] > 0, "Insufficient session credits");

        sessionCredits[user][nftContract][agentId] -= 1;
        emit SessionCreditUsed(user, nftContract, agentId);
    }

    /**
     * @dev Get session credits for a user/agent
     * @param user The user address
     * @param nftContract The NFT contract address
     * @param agentId The agent token ID
     */
    function getSessionCredits(address user, address nftContract, uint256 agentId) external view returns (uint256) {
        return sessionCredits[user][nftContract][agentId];
    }

    /**
     * @dev Set RevenueShare contract address
     */
    function setRevenueShareContract(address _revenueShareContract) external onlyOwner {
        revenueShareContract = _revenueShareContract;
    }

    /**
     * @dev Update credit price (only owner)
     */
    function setCreditPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        creditPrice = newPrice;
        emit CreditPriceUpdated(newPrice);
    }

    /**
     * @dev Update free tier credits (only owner)
     */
    function setFreeTierCredits(uint256 amount) external onlyOwner {
        freeTierCredits = amount;
        emit FreeTierCreditsUpdated(amount);
    }

    /**
     * @dev Authorize spender (backend service) (only owner)
     */
    function setAuthorizedSpender(address spender, bool authorized) external onlyOwner {
        require(spender != address(0), "Invalid spender address");
        authorizedSpenders[spender] = authorized;
        emit AuthorizedSpenderUpdated(spender, authorized);
    }

    /**
     * @dev Get plan details
     */
    function getPlan(uint256 planId) external view returns (CreditPlan memory) {
        require(planId < planCount, "Invalid plan ID");
        return plans[planId];
    }

    /**
     * @dev Get all active plans
     */
    function getActivePlans() external view returns (CreditPlan[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < planCount; i++) {
            if (plans[i].active) activeCount++;
        }

        CreditPlan[] memory activePlans = new CreditPlan[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < planCount; i++) {
            if (plans[i].active) {
                activePlans[index] = plans[i];
                index++;
            }
        }

        return activePlans;
    }

    /**
     * @dev Withdraw accumulated ETH (only owner)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    
  
}

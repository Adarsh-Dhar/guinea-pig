// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title CustomERC20Token
 * @dev ERC20 token with customizable name, symbol, initial supply, and buyable functionality
 */
contract CustomERC20Token is ERC20, Ownable {
    uint8 private _decimals;
    uint256 public tokenPrice; // Price per token in wei
    bool public saleActive;
    
    event TokensPurchased(address indexed buyer, uint256 quantity, uint256 totalCost);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event SaleStatusChanged(bool active);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 tokenDecimals,
        uint256 pricePerToken,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = tokenDecimals;
        tokenPrice = pricePerToken;
        saleActive = true;
        _mint(address(this), initialSupply * 10**tokenDecimals); // Mint to contract for sale
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Buy tokens with ETH
     * @param quantity Number of tokens to buy (in token units, not wei)
     */
    function buyTokens(uint256 quantity) external payable {
        require(saleActive, "Token sale is not active");
        require(quantity > 0, "Quantity must be greater than 0");
        
        uint256 tokenAmount = quantity * 10**_decimals;
        require(balanceOf(address(this)) >= tokenAmount, "Not enough tokens available");
        
        uint256 totalCost = quantity * tokenPrice;
        require(msg.value >= totalCost, "Insufficient ETH sent");
        
        // Transfer tokens to buyer
        _transfer(address(this), msg.sender, tokenAmount);
        
        // Refund excess ETH if any
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, quantity, totalCost);
    }
    
    /**
     * @dev Get cost for buying specific quantity of tokens
     */
    function getCost(uint256 quantity) external view returns (uint256) {
        return quantity * tokenPrice;
    }
    
    /**
     * @dev Get available tokens for sale
     */
    function getAvailableTokens() external view returns (uint256) {
        return balanceOf(address(this)) / 10**_decimals;
    }
    
    /**
     * @dev Update token price (only owner)
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Toggle sale status (only owner)
     */
    function setSaleActive(bool active) external onlyOwner {
        saleActive = active;
        emit SaleStatusChanged(active);
    }
    
    /**
     * @dev Withdraw contract ETH balance (only owner)
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Withdraw unsold tokens (only owner)
     */
    function withdrawUnsoldTokens(uint256 amount) external onlyOwner {
        uint256 tokenAmount = amount * 10**_decimals;
        require(balanceOf(address(this)) >= tokenAmount, "Not enough tokens in contract");
        
        _transfer(address(this), owner(), tokenAmount);
    }
    
    /**
     * @dev Mint additional tokens to contract for sale (only owner)
     */
    function mintForSale(uint256 amount) external onlyOwner {
        _mint(address(this), amount * 10**_decimals);
    }
    
    /**
     * @dev Mint tokens directly to address (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10**_decimals);
    }
    
    /**
     * @dev Burn tokens from owner's balance
     */
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount * 10**_decimals);
    }
    
    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

/**
 * @title TokenFactory
 * @dev Factory contract to create new ERC20 tokens
 */
contract TokenFactory {
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 tokenPrice,
        address indexed owner
    );
    
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 tokenPrice;
        address owner;
        uint256 createdAt;
    }
    
    mapping(address => TokenInfo[]) public ownerTokens;
    TokenInfo[] public allTokens;
    
    /**
     * @dev Create a new ERC20 token
     * @param name Token name (e.g., "My Token")
     * @param symbol Token symbol (e.g., "MTK")
     * @param initialSupply Initial supply (without decimals, e.g., 1000000 for 1M tokens)
     * @param decimals Number of decimals (typically 18)
     * @param pricePerToken Price per token in wei (e.g., 1000000000000000 for 0.001 ETH)
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals,
        uint256 pricePerToken
    ) external returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");
        
        CustomERC20Token newToken = new CustomERC20Token(
            name,
            symbol,
            initialSupply,
            decimals,
            pricePerToken,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        
        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            initialSupply: initialSupply,
            tokenPrice: pricePerToken,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        ownerTokens[msg.sender].push(tokenInfo);
        allTokens.push(tokenInfo);
        
        emit TokenCreated(tokenAddress, name, symbol, initialSupply, pricePerToken, msg.sender);
        
        return tokenAddress;
    }
    
    /**
     * @dev Get tokens created by a specific owner
     */
    function getTokensByOwner(address owner) external view returns (TokenInfo[] memory) {
        return ownerTokens[owner];
    }
    
    /**
     * @dev Get total number of tokens created
     */
    function getTotalTokensCreated() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Get token info by index
     */
    function getTokenByIndex(uint256 index) external view returns (TokenInfo memory) {
        require(index < allTokens.length, "Index out of bounds");
        return allTokens[index];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title CustomERC20Token
 * @dev ERC20 token with customizable name, symbol, and initial supply
 */
contract CustomERC20Token is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 tokenDecimals,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = tokenDecimals;
        _mint(owner, initialSupply * 10**tokenDecimals);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint additional tokens (only owner)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from owner's balance
     */
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
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
        address indexed owner
    );
    
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 initialSupply;
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
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) external returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        
        CustomERC20Token newToken = new CustomERC20Token(
            name,
            symbol,
            initialSupply,
            decimals,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        
        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            initialSupply: initialSupply,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        ownerTokens[msg.sender].push(tokenInfo);
        allTokens.push(tokenInfo);
        
        emit TokenCreated(tokenAddress, name, symbol, initialSupply, msg.sender);
        
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

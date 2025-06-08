// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IRoyaltyModule } from "../lib/protocol-core/contracts/interfaces/modules/royalty/IRoyaltyModule.sol";
import { IIPAssetRegistry } from "../lib/protocol-core/contracts/interfaces/registries/IIPAssetRegistry.sol";

/// @notice A contract that sends IP tokens to a recipient and mints royalty tokens to the sender
contract TokenFactory {
    IRoyaltyModule public immutable ROYALTY_MODULE;
    IIPAssetRegistry public immutable IP_ASSET_REGISTRY;
    IERC20 public immutable IP_TOKEN; // WIP token
    
    event TokensSentAndRoyaltyPaid(
        address indexed sender,
        address indexed recipient,
        address indexed ipAssetId,
        uint256 amount
    );
    
    constructor(
        address royaltyModule,
        address ipAssetRegistry,
        address ipToken
    ) {
        ROYALTY_MODULE = IRoyaltyModule(royaltyModule);
        IP_ASSET_REGISTRY = IIPAssetRegistry(ipAssetRegistry);
        IP_TOKEN = IERC20(ipToken);
    }
    
    /// @notice Send IP tokens to a recipient and mint royalty tokens to msg.sender
    /// @param recipient The address to receive the IP tokens
    /// @param ipAssetId The IP Asset ID to pay royalties to
    /// @param amount The amount of IP tokens to send
    function sendTokensAndMintRoyalty(
        address recipient,
        address ipAssetId,
        uint256 amount
    ) external {
        require(recipient != address(0), "Invalid recipient");
        require(ipAssetId != address(0), "Invalid IP Asset ID");
        require(amount > 0, "Amount must be greater than 0");
        
        // Verify the IP Asset exists
        require(
            IP_ASSET_REGISTRY.isRegistered(ipAssetId),
            "IP Asset not registered"
        );
        
        // Transfer IP tokens from sender to recipient
        require(
            IP_TOKEN.transferFrom(msg.sender, recipient, amount),
            "Token transfer failed"
        );
        
        // Pay royalty on behalf of the sender to the IP Asset
        // This will mint royalty tokens to msg.sender
        ROYALTY_MODULE.payRoyaltyOnBehalf(
            ipAssetId,        // IP asset receiving royalties
            msg.sender,       // External payer (the caller)
            address(IP_TOKEN), // Payment token (WIP)
            amount            // Amount to pay as royalty
        );
        
        emit TokensSentAndRoyaltyPaid(msg.sender, recipient, ipAssetId, amount);
    }
}
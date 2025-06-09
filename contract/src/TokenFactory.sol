// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import { IIPAssetRegistry } from "../lib/protocol-core/contracts/interfaces/registries/IIPAssetRegistry.sol";

/// @notice A contract that sends native IP tokens to a recipient and triggers royalty token minting
contract TokenFactory {
    event TokensSentAndRoyaltyPaid(
        address indexed sender,
        address indexed recipient,
        address indexed ipAssetId,
        uint256 amount
    );
    
    /// @notice Send native IP tokens to a recipient
    /// @dev The actual royalty payment should be handled via SDK with auto-conversion
    /// @param recipient The address to receive the native IP tokens
    /// @param ipAssetId The IP Asset ID for royalty tracking
    /// @param ipAssetRegistry The address of the IP asset registry
    function sendTokens(
        address recipient,
        address ipAssetId,
        address ipAssetRegistry
    ) external payable {
        require(recipient != address(0), "Invalid recipient");
        require(ipAssetId != address(0), "Invalid IP Asset ID");
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Verify the IP Asset exists
        require(
            IIPAssetRegistry(ipAssetRegistry).isRegistered(ipAssetId),
            "IP Asset not registered"
        );
        
        // Transfer native IP tokens to recipient
        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Native token transfer failed");
        
        emit TokensSentAndRoyaltyPaid(msg.sender, recipient, ipAssetId, msg.value);
    }
    
    /// @notice Allow contract to receive native tokens
    receive() external payable {}
}
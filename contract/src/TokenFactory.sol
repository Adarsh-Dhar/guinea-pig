// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {IIPAssetRegistry} from "../lib/protocol-core/contracts/interfaces/registries/IIPAssetRegistry.sol";
import {IRoyaltyModule} from "../lib/protocol-core/contracts/interfaces/modules/royalty/IRoyaltyModule.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

interface IWETH9 {
    function deposit() external payable;
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
}

contract TokenFactory {
    // Story Protocol addresses
    address public constant ROYALTY_MODULE = 0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086;
    address public constant WIP_TOKEN = 0x1514000000000000000000000000000000000000;
    address public constant DEFAULT_ROYALTY_POLICY = 0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E;
    address public constant IP_ASSET_REGISTRY = 0x77319B4031e6eF1250907aa00018B8B1c67a244b;

    event RoyaltyPaid(
        address indexed payer,
        address indexed recipient,
        address indexed ipAssetId,
        address revenueToken,
        uint256 amount
    );
    
    event WrappedTokens(
        address indexed wrapper,
        uint256 amount
    );

    /// @notice Send native IP tokens to a recipient and trigger royalty token minting
    /// @param recipient The address to receive the royalty tokens
    /// @param ipAssetId The IP Asset ID for royalty tracking
    function sendTokens(
        address recipient,
        address ipAssetId
    ) external payable {
        require(recipient != address(0), "Invalid recipient");
        require(ipAssetId != address(0), "Invalid IP Asset ID");
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Verify the IP Asset exists
        require(
            IIPAssetRegistry(IP_ASSET_REGISTRY).isRegistered(ipAssetId),
            "IP Asset not registered"
        );
        
        // Wrap native tokens to WIP
        IWETH9(WIP_TOKEN).deposit{value: msg.value}();
        emit WrappedTokens(address(this), msg.value);
        
        // Approve RoyaltyModule to spend WIP
        require(
            IERC20(WIP_TOKEN).approve(ROYALTY_MODULE, msg.value),
            "WIP approval failed"
        );
        
        // Pay royalty via Story Protocol's RoyaltyModule
        IRoyaltyModule(ROYALTY_MODULE).payRoyaltyOnBehalf(
            ipAssetId,
            DEFAULT_ROYALTY_POLICY,
            WIP_TOKEN,
            msg.value
        );
        
        emit RoyaltyPaid(msg.sender, recipient, ipAssetId, WIP_TOKEN, msg.value);
    }
    
    /// @notice Allow contract to receive native tokens
    receive() external payable {}
}
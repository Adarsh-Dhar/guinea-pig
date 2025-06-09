// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import { Test } from "forge-std/Test.sol";
import { TokenFactory } from "../src/TokenFactory.sol";
import { MockERC20 } from "../lib/protocol-core/test/foundry/mocks/token/MockERC20.sol";
import { MockRoyaltyModule } from "../lib/protocol-core/test/foundry/mocks/module/MockRoyaltyModule.sol";

// Minimal mock for IIPAssetRegistry
type addressAlias is address;
interface IIPAssetRegistry {
    function isRegistered(address id) external view returns (bool);
}

contract MockIPAssetRegistry is IIPAssetRegistry {
    mapping(address => bool) public registered;
    function setRegistered(address id, bool value) external {
        registered[id] = value;
    }
    function isRegistered(address id) external view override returns (bool) {
        return registered[id];
    }
}

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    MockERC20 public token;
    MockRoyaltyModule public royaltyModule;
    MockIPAssetRegistry public ipAssetRegistry;
    address public user = address(0x123);
    address public recipient = address(0x456);
    address public ipAssetId = address(0x789);

    function setUp() public {
        token = new MockERC20();
        royaltyModule = new MockRoyaltyModule();
        ipAssetRegistry = new MockIPAssetRegistry();
        factory = new TokenFactory();
        // Mint tokens to user and approve factory
        token.mint(user, 1000 ether);
        vm.prank(user);
        token.approve(address(factory), 1000 ether);
        // Register the IP asset
        ipAssetRegistry.setRegistered(ipAssetId, true);
    }

    function testSendTokensAndMintRoyalty() public {
        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit TokenFactory.TokensSentAndRoyaltyPaid(user, recipient, ipAssetId, 10 ether);
        factory.sendTokens(recipient, ipAssetId, address(ipAssetRegistry));
        assertEq(token.balanceOf(recipient), 10 ether);
        assertEq(token.balanceOf(user), 990 ether);
    }

    function testRevertIfNotRegistered() public {
        address unregistered = address(0x999);
        vm.prank(user);
        vm.expectRevert("IP Asset not registered");
        factory.sendTokens(recipient, unregistered, address(ipAssetRegistry));
    }

    function testRevertIfZeroAmount() public {
        vm.prank(user);
        vm.expectRevert("Amount must be greater than 0");
        factory.sendTokens(recipient, ipAssetId, address(ipAssetRegistry));
    }

    function testRevertIfInvalidRecipient() public {
        vm.prank(user);
        vm.expectRevert("Invalid recipient");
        factory.sendTokens(address(0), ipAssetId, address(ipAssetRegistry));
    }

    function testRevertIfInvalidIpAssetId() public {
        vm.prank(user);
        vm.expectRevert("Invalid IP Asset ID");
        factory.sendTokens(recipient, address(0), address(ipAssetRegistry));
    }
}

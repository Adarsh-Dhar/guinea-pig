// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import { Script } from "forge-std/Script.sol";
import { TokenFactory } from "../src/TokenFactory.sol";
import { MockERC20 } from "../lib/protocol-core/test/foundry/mocks/token/MockERC20.sol";
import { MockRoyaltyModule } from "../lib/protocol-core/test/foundry/mocks/module/MockRoyaltyModule.sol";
import { console2 } from "forge-std/console2.sol";

contract DeployTokenFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mocks for local testing
        MockERC20 token = new MockERC20();
        MockRoyaltyModule royaltyModule = new MockRoyaltyModule();
        address mockRegistry = address(0x123456); // Use a dummy address or deploy a mock if needed

        TokenFactory factory = new TokenFactory(
            address(royaltyModule),
            mockRegistry,
            address(token)
        );

        console2.log("TokenFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
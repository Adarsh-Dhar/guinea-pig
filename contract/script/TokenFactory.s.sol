// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import { Script } from "forge-std/Script.sol";
import { TokenFactory } from "../src/TokenFactory.sol";

import { console2 } from "forge-std/console2.sol";

contract DeployTokenFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);


        TokenFactory factory = new TokenFactory();

        console2.log("TokenFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
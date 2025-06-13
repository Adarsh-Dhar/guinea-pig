// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Script.sol";
import "../src/Escrow.sol";

contract DeployMilestoneEscrow is Script {
    function run() external {
        // Get the private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the MilestoneEscrow contract
        MilestoneEscrow escrow = new MilestoneEscrow();

        // Log the deployed contract address
        console.log("MilestoneEscrow deployed to:", address(escrow));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        vm.stopBroadcast();
    }
}
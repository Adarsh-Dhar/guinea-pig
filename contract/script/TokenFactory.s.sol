// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Script.sol";
import "../src/TokenFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        TokenFactory factory = new TokenFactory();
        
        console.log("TokenFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
}
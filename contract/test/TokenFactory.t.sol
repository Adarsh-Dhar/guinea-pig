// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TokenFactory.sol";

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    address public user1;
    address public user2;
    
    function setUp() public {
        factory = new TokenFactory();
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
    }
    
    function testCreateToken() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Test Token",
            "TEST",
            1000000,
            18,
            1000000000000000 // 0.001 ETH per token
        );
        
        assertTrue(tokenAddress != address(0));
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.totalSupply(), 1000000 * 10**18);
        assertEq(token.balanceOf(address(token)), 1000000 * 10**18); // Tokens are in contract
        assertEq(token.tokenPrice(), 1000000000000000);
        assertEq(token.owner(), user1);
        assertTrue(token.saleActive());
        
        vm.stopPrank();
    }
    
    function testCreateMultipleTokens() public {
        vm.startPrank(user1);
        
        factory.createToken("Token A", "TKA", 500000, 18, 2000000000000000);
        factory.createToken("Token B", "TKB", 200000, 6, 5000000000000000);
        
        TokenFactory.TokenInfo[] memory userTokens = factory.getTokensByOwner(user1);
        assertEq(userTokens.length, 2);
        assertEq(userTokens[0].symbol, "TKA");
        assertEq(userTokens[1].symbol, "TKB");
        assertEq(userTokens[0].tokenPrice, 2000000000000000);
        assertEq(userTokens[1].tokenPrice, 5000000000000000);
        
        vm.stopPrank();
    }
    
    function testFailEmptyName() public {
        factory.createToken("", "TEST", 1000, 18, 1000000000000000);
    }
    
    function testFailEmptySymbol() public {
        factory.createToken("Test", "", 1000, 18, 1000000000000000);
    }
    
    function testFailZeroSupply() public {
        factory.createToken("Test", "TEST", 0, 18, 1000000000000000);
    }
    
    function testFailZeroPrice() public {
        factory.createToken("Test", "TEST", 1000, 18, 0);
    }
    
    function testBuyTokens() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Buyable Token",
            "BUY",
            1000,
            18,
            1000000000000000 // 0.001 ETH per token
        );
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        vm.stopPrank();
        
        // Give user2 some ETH
        vm.deal(user2, 10 ether);
        
        vm.startPrank(user2);
        
        // Buy 100 tokens
        uint256 tokensToBuy = 100;
        uint256 cost = token.getCost(tokensToBuy);
        assertEq(cost, 100000000000000000); // 0.1 ETH
        
        uint256 initialBalance = token.balanceOf(user2);
        token.buyTokens{value: cost}(tokensToBuy);
        
        assertEq(token.balanceOf(user2), initialBalance + (tokensToBuy * 10**18));
        assertEq(address(token).balance, cost);
        
        vm.stopPrank();
    }
    
    function testBuyTokensWithExcessETH() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Refund Token",
            "REF",
            1000,
            18,
            1000000000000000
        );
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        vm.stopPrank();
        
        vm.deal(user2, 10 ether);
        vm.startPrank(user2);
        
        uint256 initialETHBalance = user2.balance;
        uint256 tokensToBuy = 50;
        uint256 cost = token.getCost(tokensToBuy);
        uint256 excessETH = 1 ether;
        
        token.buyTokens{value: cost + excessETH}(tokensToBuy);
        
        // Should refund excess ETH
        assertEq(user2.balance, initialETHBalance - cost);
        assertEq(token.balanceOf(user2), tokensToBuy * 10**18);
        
        vm.stopPrank();
    }
    
    function testFailBuyTokensInsufficientETH() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Expensive Token",
            "EXP",
            1000,
            18,
            1000000000000000
        );
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        vm.stopPrank();
        
        vm.deal(user2, 0.01 ether);
        vm.startPrank(user2);
        
        // Try to buy 100 tokens with insufficient ETH
        token.buyTokens{value: 0.01 ether}(100);
        
        vm.stopPrank();
    }
    
    function testFailBuyTokensWhenSaleInactive() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Inactive Token",
            "INAC",
            1000,
            18,
            1000000000000000
        );
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        token.setSaleActive(false);
        vm.stopPrank();
        
        vm.deal(user2, 1 ether);
        vm.startPrank(user2);
        
        token.buyTokens{value: 0.1 ether}(100);
        
        vm.stopPrank();
    }
    
    function testTokenManagement() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Management Token",
            "MGT",
            1000,
            18,
            1000000000000000
        );
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        
        // Test price update
        token.setTokenPrice(2000000000000000);
        assertEq(token.tokenPrice(), 2000000000000000);
        
        // Test withdrawing unsold tokens
        uint256 initialContractBalance = token.balanceOf(address(token));
        token.withdrawUnsoldTokens(100);
        assertEq(token.balanceOf(address(token)), initialContractBalance - (100 * 10**18));
        assertEq(token.balanceOf(user1), 100 * 10**18);
        
        // Test minting for sale
        token.mintForSale(200);
        assertEq(token.balanceOf(address(token)), initialContractBalance - (100 * 10**18) + (200 * 10**18));
        
        vm.stopPrank();
    }
    
    function testWithdrawFunds() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken(
            "Withdraw Token",
            "WITH",
            1000,
            18,
            1000000000000000
        );
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        vm.stopPrank();
        
        // User2 buys tokens
        vm.deal(user2, 1 ether);
        vm.startPrank(user2);
        token.buyTokens{value: 0.1 ether}(100);
        vm.stopPrank();
        
        // Owner withdraws funds
        vm.startPrank(user1);
        uint256 initialBalance = user1.balance;
        token.withdrawFunds();
        assertEq(user1.balance, initialBalance + 0.1 ether);
        assertEq(address(token).balance, 0);
        vm.stopPrank();
    }
}

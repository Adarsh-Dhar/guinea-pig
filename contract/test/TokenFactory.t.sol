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
            18
        );
        
        assertTrue(tokenAddress != address(0));
        
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.totalSupply(), 1000000 * 10**18);
        assertEq(token.balanceOf(user1), 1000000 * 10**18);
        assertEq(token.owner(), user1);
        
        vm.stopPrank();
    }
    
    function testCreateMultipleTokens() public {
        vm.startPrank(user1);
        
        factory.createToken("Token A", "TKA", 500000, 18);
        factory.createToken("Token B", "TKB", 200000, 6);
        
        TokenFactory.TokenInfo[] memory userTokens = factory.getTokensByOwner(user1);
        assertEq(userTokens.length, 2);
        assertEq(userTokens[0].symbol, "TKA");
        assertEq(userTokens[1].symbol, "TKB");
        
        vm.stopPrank();
    }
    
    function testFailEmptyName() public {
        factory.createToken("", "TEST", 1000, 18);
    }
    
    function testFailEmptySymbol() public {
        factory.createToken("Test", "", 1000, 18);
    }
    
    function testFailZeroSupply() public {
        factory.createToken("Test", "TEST", 0, 18);
    }
    
    function testTokenOwnership() public {
        vm.startPrank(user1);
        
        address tokenAddress = factory.createToken("Owner Test", "OWN", 1000, 18);
        CustomERC20Token token = CustomERC20Token(tokenAddress);
        
        // Owner can mint
        token.mint(user2, 500 * 10**18);
        assertEq(token.balanceOf(user2), 500 * 10**18);
        
        // Owner can burn
        token.burn(100 * 10**18);
        assertEq(token.balanceOf(user1), (1000 * 10**18) - (100 * 10**18));
        
        vm.stopPrank();
        
        // Non-owner cannot mint
        vm.startPrank(user2);
        vm.expectRevert();
        token.mint(user2, 100 * 10**18);
        vm.stopPrank();
    }
    
    function testFactoryStats() public {
        assertEq(factory.getTotalTokensCreated(), 0);
        
        vm.prank(user1);
        factory.createToken("Token 1", "TK1", 1000, 18);
        
        vm.prank(user2);
        factory.createToken("Token 2", "TK2", 2000, 18);
        
        assertEq(factory.getTotalTokensCreated(), 2);
        
        TokenFactory.TokenInfo memory token1 = factory.getTokenByIndex(0);
        assertEq(token1.symbol, "TK1");
        assertEq(token1.owner, user1);
        
        TokenFactory.TokenInfo memory token2 = factory.getTokenByIndex(1);
        assertEq(token2.symbol, "TK2");
        assertEq(token2.owner, user2);
    }
}
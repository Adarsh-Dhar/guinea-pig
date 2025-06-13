// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import "../src/Escrow.sol";

contract MilestoneEscrowTest is Test {
    MilestoneEscrow public escrow;
    
    address public payer = address(1);
    address public recipient = address(2);
    address public owner = address(this);
    
    uint256 public constant INITIAL_BALANCE = 10 ether;
    uint256 public constant MILESTONE_AMOUNT_1 = 1 ether;
    uint256 public constant MILESTONE_AMOUNT_2 = 2 ether;
    uint256 public constant MILESTONE_AMOUNT_3 = 1.5 ether;
    
    string[] public milestoneDescriptions;
    uint256[] public milestoneAmounts;
    
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed recipient,
        uint256 totalAmount,
        uint256 milestoneCount
    );
    
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 indexed milestoneId,
        uint256 amount,
        address recipient
    );
    
    event FundsReleased(
        uint256 indexed escrowId,
        address indexed recipient,
        uint256 amount
    );
    
    event EscrowCancelled(
        uint256 indexed escrowId,
        address indexed payer,
        uint256 refundAmount
    );

    function setUp() public {
        escrow = new MilestoneEscrow();
        
        // Fund test accounts
        vm.deal(payer, INITIAL_BALANCE);
        vm.deal(recipient, INITIAL_BALANCE);
        
        // Set up milestone data
        milestoneDescriptions.push("Complete project design");
        milestoneDescriptions.push("Implement core functionality");
        milestoneDescriptions.push("Deploy and test");
        
        milestoneAmounts.push(MILESTONE_AMOUNT_1);
        milestoneAmounts.push(MILESTONE_AMOUNT_2);
        milestoneAmounts.push(MILESTONE_AMOUNT_3);
    }
    
    function testCreateEscrow() public {
        vm.startPrank(payer);
        
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        
        vm.expectEmit(true, true, true, true);
        emit EscrowCreated(1, payer, recipient, totalAmount, 3);
        
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        assertEq(escrowId, 1);
        assertEq(escrow.escrowCounter(), 1);
        assertEq(address(escrow).balance, totalAmount);
        
        // Check escrow details
        (
            address _payer,
            address _recipient,
            uint256 _totalAmount,
            uint256 _releasedAmount,
            uint256 _milestoneCount,
            uint256 _completedMilestones,
            bool _isActive,
            uint256 _createdAt
        ) = escrow.getEscrowDetails(escrowId);
        
        assertEq(_payer, payer);
        assertEq(_recipient, recipient);
        assertEq(_totalAmount, totalAmount);
        assertEq(_releasedAmount, 0);
        assertEq(_milestoneCount, 3);
        assertEq(_completedMilestones, 0);
        assertTrue(_isActive);
        assertGt(_createdAt, 0);
        
        vm.stopPrank();
    }
    
    function testCreateEscrowFailures() public {
        vm.startPrank(payer);
        
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        
        // Test: Zero recipient address
        vm.expectRevert("Invalid recipient address");
        escrow.createEscrow{value: totalAmount}(
            address(0),
            milestoneDescriptions,
            milestoneAmounts
        );
        
        // Test: Same payer and recipient
        vm.expectRevert("Payer and recipient cannot be the same");
        escrow.createEscrow{value: totalAmount}(
            payer,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        // Test: No milestones
        string[] memory emptyDescriptions;
        uint256[] memory emptyAmounts;
        vm.expectRevert("At least one milestone required");
        escrow.createEscrow{value: totalAmount}(
            recipient,
            emptyDescriptions,
            emptyAmounts
        );
        
        // Test: Mismatched arrays
        string[] memory shortDescriptions = new string[](2);
        shortDescriptions[0] = "Milestone 1";
        shortDescriptions[1] = "Milestone 2";
        
        vm.expectRevert("Mismatched arrays");
        escrow.createEscrow{value: totalAmount}(
            recipient,
            shortDescriptions,
            milestoneAmounts
        );
        
        // Test: No funds sent
        vm.expectRevert("Must send funds to escrow");
        escrow.createEscrow{value: 0}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        // Test: Incorrect amount
        vm.expectRevert("Sent amount must equal total milestone amounts");
        escrow.createEscrow{value: 1 ether}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        vm.stopPrank();
    }
    
    function testCompleteMilestone() public {
        // Create escrow first
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        uint256 recipientBalanceBefore = recipient.balance;
        
        // Complete first milestone
        vm.expectEmit(true, true, true, true);
        emit MilestoneCompleted(escrowId, 0, MILESTONE_AMOUNT_1, recipient);
        
        vm.expectEmit(true, true, true, true);
        emit FundsReleased(escrowId, recipient, MILESTONE_AMOUNT_1);
        
        escrow.completeMilestone(escrowId, 0);
        
        // Check milestone completion
        (
            string memory description,
            uint256 amount,
            bool completed,
            uint256 completedAt
        ) = escrow.getMilestone(escrowId, 0);
        
        assertEq(description, "Complete project design");
        assertEq(amount, MILESTONE_AMOUNT_1);
        assertTrue(completed);
        assertGt(completedAt, 0);
        
        // Check balances
        assertEq(recipient.balance, recipientBalanceBefore + MILESTONE_AMOUNT_1);
        assertEq(escrow.getEscrowBalance(escrowId), totalAmount - MILESTONE_AMOUNT_1);
        
        // Check escrow details
        (, , , uint256 releasedAmount, , uint256 completedMilestones, bool isActive, ) = 
            escrow.getEscrowDetails(escrowId);
        
        assertEq(releasedAmount, MILESTONE_AMOUNT_1);
        assertEq(completedMilestones, 1);
        assertTrue(isActive); // Should still be active
        
        vm.stopPrank();
    }
    
    function testCompleteAllMilestones() public {
        // Create escrow
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        uint256 recipientBalanceBefore = recipient.balance;
        
        // Complete all milestones
        escrow.completeMilestone(escrowId, 0);
        escrow.completeMilestone(escrowId, 1);
        escrow.completeMilestone(escrowId, 2);
        
        // Check final state
        assertEq(recipient.balance, recipientBalanceBefore + totalAmount);
        assertEq(escrow.getEscrowBalance(escrowId), 0);
        
        (, , , uint256 releasedAmount, , uint256 completedMilestones, bool isActive, ) = 
            escrow.getEscrowDetails(escrowId);
        
        assertEq(releasedAmount, totalAmount);
        assertEq(completedMilestones, 3);
        assertFalse(isActive); // Should be inactive after all milestones
        
        vm.stopPrank();
    }
    
    function testCompleteMilestoneFailures() public {
        // Create escrow
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        vm.stopPrank();
        
        // Test: Non-payer trying to complete milestone
        vm.startPrank(recipient);
        vm.expectRevert("Only payer can call this");
        escrow.completeMilestone(escrowId, 0);
        vm.stopPrank();
        
        // Test: Invalid milestone ID
        vm.startPrank(payer);
        vm.expectRevert("Invalid milestone ID");
        escrow.completeMilestone(escrowId, 10);
        
        // Complete milestone first
        escrow.completeMilestone(escrowId, 0);
        
        // Test: Already completed milestone
        vm.expectRevert("Milestone already completed");
        escrow.completeMilestone(escrowId, 0);
        
        vm.stopPrank();
    }
    
    function testCancelEscrow() public {
        // Create escrow
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        
        // Complete one milestone
        escrow.completeMilestone(escrowId, 0);
        
        uint256 payerBalanceBefore = payer.balance;
        uint256 expectedRefund = totalAmount - MILESTONE_AMOUNT_1;
        
        vm.expectEmit(true, true, true, true);
        emit EscrowCancelled(escrowId, payer, expectedRefund);
        
        escrow.cancelEscrow(escrowId);
        
        // Check refund
        assertEq(payer.balance, payerBalanceBefore + expectedRefund);
        
        // Check escrow is inactive
        (, , , , , , bool isActive, ) = escrow.getEscrowDetails(escrowId);
        assertFalse(isActive);
        
        vm.stopPrank();
    }
    
    function testCancelEscrowFailures() public {
        // Create escrow
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        vm.stopPrank();
        
        // Test: Non-payer trying to cancel
        vm.startPrank(recipient);
        vm.expectRevert("Only payer can call this");
        escrow.cancelEscrow(escrowId);
        vm.stopPrank();
        
        // Cancel escrow
        vm.startPrank(payer);
        escrow.cancelEscrow(escrowId);
        
        // Test: Trying to cancel already cancelled escrow
        vm.expectRevert("Escrow is not active");
        escrow.cancelEscrow(escrowId);
        
        vm.stopPrank();
    }
    
    function testEmergencyWithdraw() public {
        // Create escrow to have funds in contract
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        vm.stopPrank();
        
        uint256 contractBalance = address(escrow).balance;
        uint256 ownerBalanceBefore = owner.balance;
        
        // Emergency withdraw as owner
        escrow.emergencyWithdraw();
        
        assertEq(owner.balance, ownerBalanceBefore + contractBalance);
        assertEq(address(escrow).balance, 0);
    }
    
    function testEmergencyWithdrawFailures() public {
        // Test: Non-owner trying to emergency withdraw
        vm.startPrank(payer);
        vm.expectRevert("Ownable: caller is not the owner");
        escrow.emergencyWithdraw();
        vm.stopPrank();
        
        // Test: No funds to withdraw
        vm.expectRevert("No funds to withdraw");
        escrow.emergencyWithdraw();
    }
    
    function testGetFunctions() public {
        // Create escrow
        vm.startPrank(payer);
        uint256 totalAmount = MILESTONE_AMOUNT_1 + MILESTONE_AMOUNT_2 + MILESTONE_AMOUNT_3;
        uint256 escrowId = escrow.createEscrow{value: totalAmount}(
            recipient,
            milestoneDescriptions,
            milestoneAmounts
        );
        vm.stopPrank();
        
        // Test getEscrowDetails
        (
            address _payer,
            address _recipient,
            uint256 _totalAmount,
            uint256 _releasedAmount,
            uint256 _milestoneCount,
            uint256 _completedMilestones,
            bool _isActive,
            uint256 _createdAt
        ) = escrow.getEscrowDetails(escrowId);
        
        assertEq(_payer, payer);
        assertEq(_recipient, recipient);
        assertEq(_totalAmount, totalAmount);
        assertEq(_releasedAmount, 0);
        assertEq(_milestoneCount, 3);
        assertEq(_completedMilestones, 0);
        assertTrue(_isActive);
        assertGt(_createdAt, 0);
        
        // Test getMilestone
        (
            string memory description,
            uint256 amount,
            bool completed,
            uint256 completedAt
        ) = escrow.getMilestone(escrowId, 0);
        
        assertEq(description, "Complete project design");
        assertEq(amount, MILESTONE_AMOUNT_1);
        assertFalse(completed);
        assertEq(completedAt, 0);
        
        // Test getEscrowBalance
        assertEq(escrow.getEscrowBalance(escrowId), totalAmount);
        
        // Test getContractBalance
        assertEq(escrow.getContractBalance(), totalAmount);
    }
    
    function testDirectPaymentRejection() public {
        vm.startPrank(payer);
        
        // Test receive function
        vm.expectRevert("Direct payments not allowed");
        (bool success, ) = address(escrow).call{value: 1 ether}("");
        assertFalse(success);
        
        // Test fallback function
        vm.expectRevert("Function not found");
        (success, ) = address(escrow).call{value: 1 ether}("nonexistentFunction()");
        assertFalse(success);
        
        vm.stopPrank();
    }
    
    function testNonexistentEscrow() public {
        vm.expectRevert("Escrow does not exist");
        escrow.getEscrowDetails(999);
        
        vm.expectRevert("Escrow does not exist");
        escrow.getMilestone(999, 0);
        
        vm.expectRevert("Escrow does not exist");
        escrow.getEscrowBalance(999);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/Openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MilestoneEscrow
 * @dev Escrow contract that holds native tokens and releases them based on milestone completion
 */
contract MilestoneEscrow is ReentrancyGuard {
    struct Escrow {
        address payer;
        address recipient;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestoneCount;
        uint256 completedMilestones;
        mapping(uint256 => Milestone) milestones;
        bool isActive;
        uint256 createdAt;
    }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        uint256 completedAt;
    }

    // Events
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
    
    event FundsAdded(
        uint256 indexed escrowId,
        address indexed payer,
        uint256 amount,
        uint256 newTotalAmount
    );

    // State variables
    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCounter;
    uint256 public constant MIN_MILESTONE_AMOUNT = 0.001 ether;

    // Modifiers
    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId > 0 && _escrowId <= escrowCounter, "Escrow does not exist");
        _;
    }

    modifier onlyPayer(uint256 _escrowId) {
        require(escrows[_escrowId].payer == msg.sender, "Only payer can call this");
        _;
    }

    modifier onlyRecipient(uint256 _escrowId) {
        require(escrows[_escrowId].recipient == msg.sender, "Only recipient can call this");
        _;
    }

    modifier escrowActive(uint256 _escrowId) {
        require(escrows[_escrowId].isActive, "Escrow is not active");
        _;
    }

    // New modifier for escrow recipient as 'owner' for that escrow
    modifier onlyEscrowRecipient(uint256 _escrowId) {
        require(escrows[_escrowId].recipient == msg.sender, "Only escrow recipient can call this");
        _;
    }

    constructor() ReentrancyGuard() {}

    /**
     * @dev Add additional funds to an existing escrow
     * @param _escrowId ID of the escrow to add funds to
     * @param _additionalMilestoneDescriptions Array of new milestone descriptions (optional)
     * @param _additionalMilestoneAmounts Array of amounts for new milestones (optional)
     */
    function addFunds(
        uint256 _escrowId,
        string[] memory _additionalMilestoneDescriptions,
        uint256[] memory _additionalMilestoneAmounts
    ) external payable escrowExists(_escrowId) escrowActive(_escrowId) {
        require(msg.value > 0, "Must send funds");
        require(
            _additionalMilestoneDescriptions.length == _additionalMilestoneAmounts.length,
            "Mismatched arrays"
        );

        Escrow storage escrow = escrows[_escrowId];
        
        if (_additionalMilestoneDescriptions.length > 0) {
            // Adding new milestones
            uint256 totalNewMilestoneAmount = 0;
            for (uint256 i = 0; i < _additionalMilestoneAmounts.length; i++) {
                require(_additionalMilestoneAmounts[i] >= MIN_MILESTONE_AMOUNT, "Milestone amount too small");
                totalNewMilestoneAmount += _additionalMilestoneAmounts[i];
            }
            
            // Add new milestones
            uint256 currentMilestoneCount = escrow.milestoneCount;
            for (uint256 i = 0; i < _additionalMilestoneDescriptions.length; i++) {
                escrow.milestones[currentMilestoneCount + i] = Milestone({
                    description: _additionalMilestoneDescriptions[i],
                    amount: _additionalMilestoneAmounts[i],
                    completed: false,
                    completedAt: 0
                });
            }
            
            escrow.milestoneCount += _additionalMilestoneDescriptions.length;
        } else {
            // Distribute additional funds proportionally among uncompleted milestones
            uint256 uncompletedMilestones = escrow.milestoneCount - escrow.completedMilestones;
            require(uncompletedMilestones > 0, "No uncompleted milestones to add funds to");
            
            uint256 additionalAmountPerMilestone = msg.value / uncompletedMilestones;
            uint256 remainder = msg.value % uncompletedMilestones;
            
            // Distribute funds among uncompleted milestones
            for (uint256 i = 0; i < escrow.milestoneCount; i++) {
                if (!escrow.milestones[i].completed) {
                    escrow.milestones[i].amount += additionalAmountPerMilestone;
                    // Add remainder to the first uncompleted milestone
                    if (remainder > 0) {
                        escrow.milestones[i].amount += remainder;
                        remainder = 0;
                    }
                }
            }
        }
        
        escrow.totalAmount += msg.value;
        
        emit FundsAdded(_escrowId, msg.sender, msg.value, escrow.totalAmount);
    }

    /**
     * @dev Create a new escrow with milestones
     * @param _recipient Address that will receive the funds
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _milestoneAmounts Array of amounts for each milestone
     */
    function createEscrow(
        address _recipient,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) external returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(_recipient == msg.sender, "Payer and recipient should be same");
        require(_milestoneDescriptions.length > 0, "At least one milestone required");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Mismatched arrays");

        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] >= MIN_MILESTONE_AMOUNT, "Milestone amount too small");
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        // No payment required at creation, just save the milestones and their target amounts

        escrowCounter++;
        uint256 escrowId = escrowCounter;

        Escrow storage newEscrow = escrows[escrowId];
        newEscrow.payer = msg.sender;
        newEscrow.recipient = _recipient;
        newEscrow.totalAmount = 0; // No funds at creation
        newEscrow.releasedAmount = 0;
        newEscrow.milestoneCount = _milestoneDescriptions.length;
        newEscrow.completedMilestones = 0;
        newEscrow.isActive = true;
        newEscrow.createdAt = block.timestamp;

        // Set up milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            newEscrow.milestones[i] = Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                completed: false,
                completedAt: 0
            });
        }

        emit EscrowCreated(escrowId, msg.sender, _recipient, 0, _milestoneDescriptions.length);
        return escrowId;
    }


    /**
     * @dev Get remaining balance in escrow
     */
    function getEscrowBalance(uint256 _escrowId) 
        external 
        view 
        escrowExists(_escrowId) 
        returns (uint256) 
    {
        Escrow storage escrow = escrows[_escrowId];
        return escrow.totalAmount - escrow.releasedAmount;
    }


    /**
     * @dev Escrow recipient can withdraw a specified amount from a given escrow
     * @param _escrowId ID of the escrow to withdraw from
     * @param _amount Amount to withdraw
     */
    function ownerWithdrawFromEscrow(uint256 _escrowId, uint256 _amount) external onlyEscrowRecipient(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.isActive, "Escrow is not active");
        require(_amount > 0, "Amount must be greater than zero");
        require(_amount <= (escrow.totalAmount - escrow.releasedAmount), "Insufficient escrow balance");

        escrow.releasedAmount += _amount;
        (bool success, ) = escrow.recipient.call{value: _amount}("");
        require(success, "Owner withdrawal failed");
    }

    // Fallback functions
    receive() external payable {
        revert("Direct payments not allowed");
    }

    fallback() external payable {
        revert("Function not found");
    }
}
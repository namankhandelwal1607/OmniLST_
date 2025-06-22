//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
}

contract CCIPWithdrawalReceiver is CCIPReceiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error ETHTransferFailed();
    error InvalidSourceChain();
    error InvalidSender();
    error NoTokensReceived();
    error InvalidTokenReceived();

    IWETH public immutable weth;
    address public immutable wethAddress;

    // Mapping to track allowed source chains
    mapping(uint64 => bool) public allowedSourceChains;

    // Mapping to track allowed senders
    mapping(address => bool) public allowedSenders;

    // Track withdrawal history
    mapping(address => uint256) public totalWithdrawals;
    mapping(address => uint256) public lastWithdrawalTime;

    event WithdrawalProcessed(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address user,
        uint256 amount
    );

    event ETHSentToUser(address indexed user, uint256 amount);
    event AllowedSenderUpdated(address indexed sender, bool allowed);
    event AllowedChainUpdated(uint64 indexed chainSelector, bool allowed);
    event EmergencyWithdrawal(uint256 amount);

    constructor(
        address _router,
        address _wethAddress,
        address _owner
    ) CCIPReceiver(_router) Ownable() {
        _transferOwnership(_owner);
        wethAddress = _wethAddress;
        weth = IWETH(_wethAddress);
    }

    /// @notice Handles incoming CCIP messages for withdrawals
    /// @dev Receives WETH, unwraps to ETH, and sends directly to user
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
        nonReentrant
    {
        bytes32 messageId = any2EvmMessage.messageId;
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector;
        address sender = abi.decode(any2EvmMessage.sender, (address));

        // Validate source chain and sender
        if (!allowedSourceChains[sourceChainSelector]) {
            revert InvalidSourceChain();
        }
        if (!allowedSenders[sender]) {
            revert InvalidSender();
        }

        // Decode user address and amount from message data
        (address user, uint256 expectedAmount) = abi.decode(
            any2EvmMessage.data,
            (address, uint256)
        );

        // Process received tokens
        if (any2EvmMessage.destTokenAmounts.length == 0) {
            revert NoTokensReceived();
        }

        uint256 totalWETHReceived = 0;

        // Process all received token amounts
        for (uint256 i = 0; i < any2EvmMessage.destTokenAmounts.length; i++) {
            Client.EVMTokenAmount memory tokenAmount = any2EvmMessage.destTokenAmounts[i];
            
            // Only process WETH tokens
            if (tokenAmount.token == wethAddress) {
                totalWETHReceived += tokenAmount.amount;
            }
        }

        if (totalWETHReceived == 0) {
            revert InvalidTokenReceived();
        }

        // Unwrap WETH to ETH
        weth.withdraw(totalWETHReceived);

        // Send ETH directly to user
        _sendETHToUser(user, totalWETHReceived);

        // Update withdrawal tracking
        totalWithdrawals[user] += totalWETHReceived;
        lastWithdrawalTime[user] = block.timestamp;

        emit WithdrawalProcessed(
            messageId,
            sourceChainSelector,
            sender,
            user,
            totalWETHReceived
        );

        emit ETHSentToUser(user, totalWETHReceived);
    }

    /// @notice Safely sends ETH to user address
    /// @param user The recipient address
    /// @param amount The amount of ETH to send
    function _sendETHToUser(address user, uint256 amount) internal {
        (bool success, ) = payable(user).call{value: amount}("");
        if (!success) {
            revert ETHTransferFailed();
        }
    }

    /// @notice Set allowed source chain for receiving messages
    /// @param chainSelector The chain selector to allow/disallow
    /// @param allowed Whether the chain is allowed
    function setAllowedSourceChain(uint64 chainSelector, bool allowed)
        external
        onlyOwner
    {
        allowedSourceChains[chainSelector] = allowed;
        emit AllowedChainUpdated(chainSelector, allowed);
    }

    /// @notice Set allowed sender address
    /// @param sender The sender address to allow/disallow
    /// @param allowed Whether the sender is allowed
    function setAllowedSender(address sender, bool allowed) external onlyOwner {
        allowedSenders[sender] = allowed;
        emit AllowedSenderUpdated(sender, allowed);
    }

    /// @notice Get user's total withdrawal amount
    /// @param user The user address
    /// @return Total amount withdrawn by user
    function getUserTotalWithdrawals(address user) external view returns (uint256) {
        return totalWithdrawals[user];
    }

    /// @notice Get user's last withdrawal timestamp
    /// @param user The user address
    /// @return Timestamp of last withdrawal
    function getUserLastWithdrawalTime(address user) external view returns (uint256) {
        return lastWithdrawalTime[user];
    }

    /// @notice Get contract's ETH balance
    /// @return Current ETH balance of the contract
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Get contract's WETH balance
    /// @return Current WETH balance of the contract
    function getWETHBalance() external view returns (uint256) {
        return weth.balanceOf(address(this));
    }

    /// @notice Emergency function to withdraw all ETH from contract
    /// @dev Only owner can call this function
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert ETHTransferFailed();
        }
        emit EmergencyWithdrawal(balance);
    }

    /// @notice Emergency function to withdraw WETH tokens
    /// @dev Only owner can call this function
    function emergencyWithdrawWETH() external onlyOwner {
        uint256 wethBalance = weth.balanceOf(address(this));
        if (wethBalance > 0) {
            weth.transfer(owner(), wethBalance);
        }
    }

    /// @notice Check if a source chain is allowed
    /// @param chainSelector The chain selector to check
    /// @return Whether the chain is allowed
    function isSourceChainAllowed(uint64 chainSelector) external view returns (bool) {
        return allowedSourceChains[chainSelector];
    }

    /// @notice Check if a sender is allowed
    /// @param sender The sender address to check
    /// @return Whether the sender is allowed
    function isSenderAllowed(address sender) external view returns (bool) {
        return allowedSenders[sender];
    }

    /// @notice Receive function to accept ETH
    receive() external payable {}

    /// @notice Fallback function
    fallback() external payable {}
}
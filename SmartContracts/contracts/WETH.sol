// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WETH - Wrapped Ether
 * @dev ERC20 token that wraps Ether. Users can deposit ETH to mint WETH tokens
 * and withdraw ETH by burning WETH tokens at a 1:1 ratio.
 */
contract WETH is ERC20, Ownable, ReentrancyGuard {
    
    // Custom errors for gas efficiency
    error InsufficientBalance();
    error TransferFailed();
    error ZeroAmount();
    
    // Events
    event Deposit(address indexed account, uint256 amount);
    event Withdrawal(address indexed account, uint256 amount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);
    
    /**
     * @dev Constructor that initializes the WETH token
     * @param _owner The owner of the contract
     */
    constructor(address _owner) 
        ERC20("Wrapped Ether", "WETH") 
        Ownable() 
    {
        // WETH tokens have 18 decimals, same as ETH
        _transferOwnership(_owner);
    }
    
    /**
     * @dev Deposit ETH and mint equivalent WETH tokens to sender
     * Payable function that accepts ETH and mints WETH 1:1
     */
    function deposit() external payable nonReentrant {
        if (msg.value == 0) {
            revert ZeroAmount();
        }
        
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw ETH by burning WETH tokens
     * @param amount The amount of WETH to burn and ETH to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert ZeroAmount();
        }
        
        if (balanceOf(msg.sender) < amount) {
            revert InsufficientBalance();
        }
        
        // Burn WETH tokens first
        _burn(msg.sender, amount);
        
        // Send ETH to user
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw specific amount of ETH to a specific address
     * @param to The address to send ETH to
     * @param amount The amount of WETH to burn and ETH to send
     */
    function withdrawTo(address to, uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert ZeroAmount();
        }
        
        if (to == address(0)) {
            revert TransferFailed();
        }
        
        if (balanceOf(msg.sender) < amount) {
            revert InsufficientBalance();
        }
        
        // Burn WETH tokens from sender
        _burn(msg.sender, amount);
        
        // Send ETH to specified address
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
        
        emit Withdrawal(to, amount);
    }
    
    /**
     * @dev Deposit ETH on behalf of another address
     * @param to The address to mint WETH tokens to
     */
    function depositTo(address to) external payable nonReentrant {
        if (msg.value == 0) {
            revert ZeroAmount();
        }
        
        if (to == address(0)) {
            revert TransferFailed();
        }
        
        _mint(to, msg.value);
        emit Deposit(to, msg.value);
    }
    
    /**
     * @dev Get the total ETH balance held by this contract
     * @return The ETH balance of the contract
     */
    function totalETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Check if the contract has sufficient ETH to back all WETH tokens
     * @return true if ETH balance >= total WETH supply
     */
    function isFullyBacked() external view returns (bool) {
        return address(this).balance >= totalSupply();
    }
    
    /**
     * @dev Get the exchange rate (should always be 1:1 for WETH)
     * @return rate The exchange rate multiplied by 1e18 for precision
     */
    function exchangeRate() external pure returns (uint256 rate) {
        return 1e18; // 1:1 ratio
    }
    
    /**
     * @dev Batch deposit for multiple addresses
     * @param recipients Array of addresses to mint WETH to
     * @param amounts Array of amounts to mint to each recipient
     */
    function batchDeposit(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        payable 
        onlyOwner 
        nonReentrant 
    {
        if (recipients.length != amounts.length) {
            revert("Arrays length mismatch");
        }
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        if (msg.value != totalAmount) {
            revert("Insufficient ETH sent");
        }
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                _mint(recipients[i], amounts[i]);
                emit Deposit(recipients[i], amounts[i]);
            }
        }
    }
    
    /**
     * @dev Emergency function to withdraw ETH from contract (only owner)
     * This should only be used in extreme circumstances
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert ZeroAmount();
        }
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert TransferFailed();
        }
        
        emit EmergencyWithdrawal(owner(), balance);
    }
    
    /**
     * @dev Override transfer to add additional checks
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        if (to == address(0)) {
            revert TransferFailed();
        }
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add additional checks
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        if (to == address(0)) {
            revert TransferFailed();
        }
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Fallback function to handle direct ETH deposits
     * Automatically wraps ETH sent to the contract
     */
    receive() external payable {
        if (msg.value > 0) {
            _mint(msg.sender, msg.value);
            emit Deposit(msg.sender, msg.value);
        }
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        if (msg.value > 0) {
            _mint(msg.sender, msg.value);
            emit Deposit(msg.sender, msg.value);
        }
    }
}
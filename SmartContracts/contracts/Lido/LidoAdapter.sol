// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMockLido {
    function submit(address recipient) external payable returns (uint256);
    function redeem(uint256 amount) external;
    function getStETHAddress() external view returns (address);
}

interface IMockStETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract LidoAdapter {
    IMockLido public lido;
    IMockStETH public stETH;

    mapping(address => uint256) public userDeposits;

    constructor(address _lido) {
        lido = IMockLido(_lido);
        stETH = IMockStETH(lido.getStETHAddress());
    }

    /// Stake ETH via Lido
    function stakeETH() external payable {
        require(msg.value > 0, "Send ETH to stake");

        uint256 staked = lido.submit{value: msg.value}(msg.sender);
        userDeposits[msg.sender] += staked;
    }

    /// Redeem stETH via Lido
    function withdrawETH(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(stETH.balanceOf(msg.sender) >= amount, "Insufficient stETH balance");

        // User must approve this adapter to spend their stETH
        require(stETH.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        // Transfer stETH from user to this adapter
        require(stETH.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");

        // Approve Lido to spend the stETH that this adapter now owns
        require(stETH.approve(address(lido), amount), "Approve failed");

        // Call Lido's redeem function - this will pull the stETH from this adapter and send ETH back
        lido.redeem(amount);

        // Update user deposit tracking
        if (userDeposits[msg.sender] >= amount) {
            userDeposits[msg.sender] -= amount;
        } else {
            userDeposits[msg.sender] = 0;
        }

        // Forward the ETH received from Lido to the user
        payable(msg.sender).transfer(amount);
    }

    /// Monitor staking rewards
    function getAccumulatedRewards(address user) external view returns (uint256) {
        uint256 currentBalance = stETH.balanceOf(user);
        uint256 deposited = userDeposits[user];

        return currentBalance > deposited ? currentBalance - deposited : 0;
    }

    /// Helper function to check if user can withdraw
    function canWithdraw(address user, uint256 amount) external view returns (bool, string memory) {
        if (amount == 0) return (false, "Amount must be > 0");
        
        uint256 balance = stETH.balanceOf(user);
        if (balance < amount) return (false, "Insufficient stETH balance");
        
        uint256 allowance = stETH.allowance(user, address(this));
        if (allowance < amount) return (false, "Must approve adapter first");
        
        return (true, "Ready to withdraw");
    }

    /// Allow contract to receive ETH
    receive() external payable {}
}
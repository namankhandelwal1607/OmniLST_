// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMockRocketPool {
    function deposit(address recipient) external payable returns (uint256);
    function redeem(uint256 amount) external;
    function getRETHAddress() external view returns (address);
}

interface IMockRETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract RocketPoolAdapter {
    IMockRocketPool public rocketPool;
    IMockRETH public rETH;

    mapping(address => uint256) public userDeposits;

    constructor(address _rocketPool) {
        rocketPool = IMockRocketPool(_rocketPool);
        rETH = IMockRETH(rocketPool.getRETHAddress());
    }

    function stakeETH() external payable {
        require(msg.value > 0, "Send ETH to stake");

        uint256 staked = rocketPool.deposit{value: msg.value}(msg.sender);
        userDeposits[msg.sender] += staked;
    }

    function withdrawETH(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(rETH.balanceOf(msg.sender) >= amount, "Insufficient rETH balance");
        require(rETH.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        require(rETH.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
        require(rETH.approve(address(rocketPool), amount), "Approve failed");

        rocketPool.redeem(amount);

        if (userDeposits[msg.sender] >= amount) {
            userDeposits[msg.sender] -= amount;
        } else {
            userDeposits[msg.sender] = 0;
        }

        payable(msg.sender).transfer(amount);
    }

    function getAccumulatedRewards(address user) external view returns (uint256) {
        uint256 currentBalance = rETH.balanceOf(user);
        uint256 deposited = userDeposits[user];

        return currentBalance > deposited ? currentBalance - deposited : 0;
    }

    function canWithdraw(address user, uint256 amount) external view returns (bool, string memory) {
        if (amount == 0) return (false, "Amount must be > 0");

        uint256 balance = rETH.balanceOf(user);
        if (balance < amount) return (false, "Insufficient rETH balance");

        uint256 allowance = rETH.allowance(user, address(this));
        if (allowance < amount) return (false, "Must approve adapter first");

        return (true, "Ready to withdraw");
    }

    receive() external payable {}
}
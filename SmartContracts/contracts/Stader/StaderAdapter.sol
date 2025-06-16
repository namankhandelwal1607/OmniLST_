// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMockStader {
    function stake(address recipient) external payable returns (uint256);
    function redeem(uint256 amount) external;
    function getLsETHAddress() external view returns (address);
}

interface IMockLsETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract StaderAdapter {
    IMockStader public stader;
    IMockLsETH public lsETH;

    mapping(address => uint256) public userDeposits;

    constructor(address _stader) {
        stader = IMockStader(_stader);
        lsETH = IMockLsETH(stader.getLsETHAddress());
    }

    function stakeETH() external payable {
        require(msg.value > 0, "Send ETH to stake");

        uint256 staked = stader.stake{value: msg.value}(msg.sender);
        userDeposits[msg.sender] += staked;
    }

    function withdrawETH(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(lsETH.balanceOf(msg.sender) >= amount, "Insufficient LsETH balance");
        require(lsETH.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        require(lsETH.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
        require(lsETH.approve(address(stader), amount), "Approve failed");

        stader.redeem(amount);

        if (userDeposits[msg.sender] >= amount) {
            userDeposits[msg.sender] -= amount;
        } else {
            userDeposits[msg.sender] = 0;
        }

        payable(msg.sender).transfer(amount);
    }

    function getAccumulatedRewards(address user) external view returns (uint256) {
        uint256 currentBalance = lsETH.balanceOf(user);
        uint256 deposited = userDeposits[user];

        return currentBalance > deposited ? currentBalance - deposited : 0;
    }

    function canWithdraw(address user, uint256 amount) external view returns (bool, string memory) {
        if (amount == 0) return (false, "Amount must be > 0");

        uint256 balance = lsETH.balanceOf(user);
        if (balance < amount) return (false, "Insufficient LsETH balance");

        uint256 allowance = lsETH.allowance(user, address(this));
        if (allowance < amount) return (false, "Must approve adapter first");

        return (true, "Ready to withdraw");
    }

    receive() external payable {}
}
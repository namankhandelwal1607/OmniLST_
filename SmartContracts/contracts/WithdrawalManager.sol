// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IoLST {
    function exchangeRate() external view returns (uint256);
    function burnFrom(address account, uint256 amount) external;
}

interface IMockLsETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IMockRETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IMockStETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IMockStader {
    function stake(address recipient) external payable returns (uint256);
    function redeem(uint256 amount) external;
    function getLsETHAddress() external view returns (address);
}

interface IMockLido {
    function stake(address recipient) external payable returns (uint256);
    function redeem(uint256 amount) external;
    function getStETHAddress() external view returns (address);
}

interface IMockRocketPool {
    function stake(address recipient) external payable returns (uint256);
    function redeem(uint256 amount) external;
    function getRETHAddress() external view returns (address);
}

contract WithdrawalManager {
    IoLST public oLSTToken;
    IMockStader public stader;
    IMockLsETH public lsETH;
    IMockLido public lido;
    IMockStETH public stETH;
    IMockRocketPool public rocketPool;
    IMockRETH public rETH;

    constructor(
        address _oLSTToken,
        address _stader,
        address _rocketPool,
        address _lido
    ) {
        oLSTToken = IoLST(_oLSTToken);
        stader = IMockStader(_stader);
        lsETH = IMockLsETH(stader.getLsETHAddress());
        rocketPool = IMockRocketPool(_rocketPool);
        rETH = IMockRETH(rocketPool.getRETHAddress());
        lido = IMockLido(_lido);
        stETH = IMockStETH(lido.getStETHAddress());
    }

    function withdrawETH(uint256 oLSTAmount, uint256 A, uint256 B) external {
        require(oLSTAmount > 0, "Amount must be > 0");
        require(A + B <= 100_000, "Invalid percentages");

        oLSTToken.burnFrom(msg.sender, oLSTAmount);

        uint256 rate = oLSTToken.exchangeRate();
        uint256 totalETH = (oLSTAmount * rate) / 1e18;

        uint256 part1 = (totalETH * A) / 100_000; // Lido
        uint256 part2 = (totalETH * B) / 100_000; // RocketPool
        uint256 part3 = totalETH - part1 - part2; // Stader

        if (part1 > 0) {
            require(stETH.balanceOf(msg.sender) >= part1, "Insufficient stETH");
            require(stETH.allowance(msg.sender, address(this)) >= part1, "stETH allowance too low");
            require(stETH.transferFrom(msg.sender, address(this), part1), "stETH transfer failed");
            require(stETH.approve(address(lido), part1), "stETH approve failed");
            lido.redeem(part1);
        }

        if (part2 > 0) {
            require(rETH.balanceOf(msg.sender) >= part2, "Insufficient rETH");
            require(rETH.allowance(msg.sender, address(this)) >= part2, "rETH allowance too low");
            require(rETH.transferFrom(msg.sender, address(this), part2), "rETH transfer failed");
            require(rETH.approve(address(rocketPool), part2), "rETH approve failed");
            rocketPool.redeem(part2);
        }

        if (part3 > 0) {
            require(lsETH.balanceOf(msg.sender) >= part3, "Insufficient lsETH");
            require(lsETH.allowance(msg.sender, address(this)) >= part3, "lsETH allowance too low");
            require(lsETH.transferFrom(msg.sender, address(this), part3), "lsETH transfer failed");
            require(lsETH.approve(address(stader), part3), "lsETH approve failed");
            stader.redeem(part3);
        }

        uint256 totalReturned = part1 + part2 + part3;
        (bool sent, ) = payable(msg.sender).call{value: totalReturned}("");
        require(sent, "ETH transfer failed");
    }

    receive() external payable {}
}
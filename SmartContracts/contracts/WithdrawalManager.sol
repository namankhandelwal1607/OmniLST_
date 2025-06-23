// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IMockLsETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

interface IMockRETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

interface IMockStETH {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
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

contract WithdrawalManager is ReentrancyGuard {
    IMockStader public stader;
    IMockLsETH public lsETH;
    IMockLido public lido;
    IMockStETH public stETH;
    IMockRocketPool public rocketPool;
    IMockRETH public rETH;

    constructor(
        address _stader,
        address _rocketPool,
        address _lido
    ) {
        stader = IMockStader(_stader);
        lsETH = IMockLsETH(stader.getLsETHAddress());
        rocketPool = IMockRocketPool(_rocketPool);
        rETH = IMockRETH(rocketPool.getRETHAddress());
        lido = IMockLido(_lido);
        stETH = IMockStETH(lido.getStETHAddress());
    }

    function withdrawETH(
    uint256 oLSTAmount,
    uint256 A, // Lido % in basis points
    uint256 B, // Rocket Pool % in basis points
    uint256 rate, // oLST → ETH rate (18 decimals)
    address recipientContract // address to send ETH to
) external nonReentrant returns (address user, uint256 amountETH) {
    require(oLSTAmount > 0, "Amount must be > 0");
    require(A + B <= 100_000, "Invalid percentages");

    uint256 totalETH = (oLSTAmount * rate) / 1e18;
    uint256 part1 = (totalETH * A) / 100_000;
    uint256 part2 = (totalETH * B) / 100_000;
    uint256 part3 = totalETH - part1 - part2;

    if (part1 > 0) {
        require(stETH.balanceOf(address(this)) >= part1, "Vault: stETH shortfall");
        stETH.approve(address(lido), part1);
        lido.redeem(part1);
    }

    if (part2 > 0) {
        require(rETH.balanceOf(address(this)) >= part2, "Vault: rETH shortfall");
        rETH.approve(address(rocketPool), part2);
        rocketPool.redeem(part2);
    }

    if (part3 > 0) {
        require(lsETH.balanceOf(address(this)) >= part3, "Vault: lsETH shortfall");
        lsETH.approve(address(stader), part3);
        stader.redeem(part3);
    }

    uint256 total = part1 + part2 + part3;
    require(address(this).balance >= total, "Insufficient ETH to send");

    // 🔁 Direct ETH transfer to the recipient contract
    (bool success, ) = payable(recipientContract).call{value: total}("");
    require(success, "ETH transfer failed");

    return (msg.sender, total);
}


    receive() external payable {}
}

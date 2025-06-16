// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MockStETH.sol";

contract MockLido {
    MockStETH public stETH;
    mapping(address => uint256) public depositedETH;

    constructor() {
        stETH = new MockStETH(address(this));
    }

    /// Stake ETH and receive stETH 1:1 (mock)
    function submit(address recipient) external payable returns (uint256) {
        require(msg.value > 0, "Must send ETH");

        stETH.mint(recipient, msg.value);
        depositedETH[recipient] += msg.value;

        return msg.value;
    }

    /// Simulate redeeming stETH for ETH (burn + send ETH)
    function redeem(uint256 amount) external {
        require(address(this).balance >= amount, "Insufficient Lido ETH");

        // Pull stETH from caller (msg.sender should have approved this contract)
        require(stETH.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Burn the stETH tokens from this contract
        stETH.burnFrom(address(this), amount);

        // Send ETH back to caller (who might be an adapter)
        payable(msg.sender).transfer(amount);
    }

    /// Simulate staking yield sent manually
    receive() external payable {}

    function getStETHAddress() external view returns (address) {
        return address(stETH);
    }
}
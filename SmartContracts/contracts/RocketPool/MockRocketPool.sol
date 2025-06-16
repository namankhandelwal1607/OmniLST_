// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MockRETH.sol";

contract MockRocketPool {
    MockRETH public rETH;
    mapping(address => uint256) public depositedETH;

    constructor() {
        rETH = new MockRETH(address(this));
    }

    function deposit(address recipient) external payable returns (uint256) {
        require(msg.value > 0, "Must send ETH");

        rETH.mint(recipient, msg.value);
        depositedETH[recipient] += msg.value;

        return msg.value;
    }

    function redeem(uint256 amount) external {
        require(address(this).balance >= amount, "Insufficient RocketPool ETH");

        require(rETH.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        rETH.burnFrom(address(this), amount);
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {}

    function getRETHAddress() external view returns (address) {
        return address(rETH);
    }
}
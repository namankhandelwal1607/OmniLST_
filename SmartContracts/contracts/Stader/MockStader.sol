// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MockLsETH.sol";

contract MockStader {
    MockLsETH public lsETH;
    mapping(address => uint256) public depositedETH;

    constructor() {
        lsETH = new MockLsETH(address(this));
    }

    function stake(address recipient) external payable returns (uint256) {
        require(msg.value > 0, "Must send ETH");
        lsETH.mint(recipient, msg.value);
        depositedETH[recipient] += msg.value;
        return msg.value;
    }

    function redeem(uint256 amount) external {
        require(address(this).balance >= amount, "Insufficient Stader ETH");

        require(lsETH.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        lsETH.burnFrom(address(this), amount);
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {}

    function getLsETHAddress() external view returns (address) {
        return address(lsETH);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IoLST {
    function burnFrom(address account, uint256 amount) external;
}

contract OLstBurn is ReentrancyGuard {
    IoLST public oLSTToken;

    constructor(address _oLSTToken) payable {
        oLSTToken = IoLST(_oLSTToken);
    }

    function withdrawETH(
        uint256 oLSTAmount
    ) external nonReentrant returns (address user, uint256 amountETH) {
        require(oLSTAmount > 0, "Amount must be > 0");

        // 1. Burn the caller’s oLST
        oLSTToken.burnFrom(msg.sender, oLSTAmount);

        // 2. Return user and amount (currently same as input)
        return (msg.sender, oLSTAmount);
    }

    receive() external payable {}
}

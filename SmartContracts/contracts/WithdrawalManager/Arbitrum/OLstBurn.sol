// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IoLST {
    function burnFrom(address account, uint256 amount) external;
}

contract OLstBurn is ReentrancyGuard {
    IoLST public oLSTToken;
    event Withdrawn(address indexed user, uint256 olstBurned, uint256 ethReturned);

    constructor(address _oLSTToken) payable {
        oLSTToken = IoLST(_oLSTToken);
    }

    uint256 constant DECIMAL = 1e21;

    function withdrawETH(
        uint256 oLSTAmount
    ) external nonReentrant returns (address user, uint256 amountETH) {
        require(oLSTAmount > 0, "Amount must be > 0");

        // 1. Burn the caller’s oLST
        oLSTToken.burnFrom(msg.sender, oLSTAmount);

        // 2. Return user and amount (currently same as input)

        // ✅ Step 2: Send ETH back based on 1 ETH = 100 oLST (1e21 DECIMAL)
        uint256 ethAmount = (oLSTAmount * 1e18) / DECIMAL;


        emit Withdrawn(msg.sender, oLSTAmount, ethAmount);
        return (msg.sender, oLSTAmount);
    }

    receive() external payable {}
}
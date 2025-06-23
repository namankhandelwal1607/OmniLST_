// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasePayoutVault {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Allow the contract to receive ETH
    receive() external payable {}

    // Only owner can trigger payouts
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Withdraw ETH to a specified user
    function payout(address recipient, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        require(recipient != address(0), "Invalid recipient");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    // Optional: allows owner to withdraw all ETH
    function drainToOwner() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}

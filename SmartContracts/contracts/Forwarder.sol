// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICCIPWithdrawalSender {
    function sendETHToEthereum(address _user) external payable;
    function transferOwnership(address newOwner) external;
}

contract Forwarder {
    address public immutable target;
    address public currentOwner;

    event OwnershipClaimed(address indexed newOwner);
    event ETHForwarded(address indexed user, uint256 amount);
    event ETHForwardedToContract(address indexed contractAddress, uint256 amount);

    constructor(address _target) {
        target = _target;
    }

    /// @notice Claim ownership of the WithdrawalSender contract
    function claimOwnership() external {
        currentOwner = msg.sender;
        ICCIPWithdrawalSender(target).transferOwnership(msg.sender);
        emit OwnershipClaimed(msg.sender);
    }

    /// @notice Forwards ETH to target contract and sets `_user` as the receiver
    /// @param _user The user address to pass to `sendETHToEthereum`
    function forward(address _user) external {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to forward");

        (bool success, ) = target.call{value: amount}(
            abi.encodeWithSignature("sendETHToEthereum(address)", _user)
        );
        require(success, "Forwarding failed");

        emit ETHForwarded(_user, amount);
    }

    function forwarderEth(address payable contractAddress) external {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to forward");
        require(contractAddress != address(0), "Invalid contract address");

        (bool success, ) = contractAddress.call{value: amount}("");
        require(success, "ETH send failed");

        emit ETHForwardedToContract(contractAddress, amount);
    }


    /// @notice Accept ETH deposits
    receive() external payable {}
}

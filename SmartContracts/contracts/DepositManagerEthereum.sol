// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DepositManagerEthereum is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public olstToken;
    address public ethereumVaultReceiver;

    uint256 constant DECIMAL = 1e21;

    event Deposited(
        address indexed user,
        uint256 ethAmount,
        uint256 olstAmount
    );

    constructor(
        address _olstToken,
        address _vaultReceiver,
        address _owner
    ) Ownable() {
        _transferOwnership(_owner);
        olstToken = IERC20(_olstToken);
        ethereumVaultReceiver = _vaultReceiver;
    }

    function depositETH(uint256 _exchangeRate) external payable nonReentrant {
        require(msg.value > 0, "Deposit must be greater than 0");

        // Forward native ETH to the vault receiver
        (bool success, ) = payable(ethereumVaultReceiver).call{value: msg.value}("");
        require(success, "ETH transfer to vault failed");

        // Calculate and transfer oLST tokens
         uint256 _amount = msg.value;
        uint256 omniTokenToTransfer = (_amount * _exchangeRate * DECIMAL)/1e18;
        olstToken.safeTransfer(msg.sender, omniTokenToTransfer);

        emit Deposited(msg.sender, msg.value, omniTokenToTransfer);
    }

    receive() external payable {}
}

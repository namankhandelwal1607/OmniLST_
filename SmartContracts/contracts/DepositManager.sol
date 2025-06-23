// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
}

interface ICCIPSender {
    function sendToEthereum(
        address _receiver,
        address _token,
        uint256 _amount,
        address _user
    ) external;
}

contract DepositManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IRouterClient public ccipRouter;
    IWETH public weth;
    IERC20 public Omnitoken;
    address public ccipSender;
    address public vaultController;

    event Deposited(address indexed user, uint256 amount);

    constructor(
        address _router,
        address _weth,
        address _ccipSender,
        address _vaultController,
        address _owner,
        address _Omnitoken
    ) Ownable() {
        _transferOwnership(_owner);
        ccipRouter = IRouterClient(_router);
        weth = IWETH(_weth);
        ccipSender = _ccipSender;
        vaultController = _vaultController;
        Omnitoken = IERC20(_Omnitoken);
    }

    function depositETH(uint256 _exchangeRate)
        external
        payable
        nonReentrant
    {
        require(msg.value > 0, "Zero deposit");
        require(_exchangeRate > 0, "Invalid exchange rate");

        // Wrap ETH into WETH
        weth.deposit{value: msg.value}();
        IERC20(weth).safeTransfer(ccipSender, msg.value);

        // Send WETH to Ethereum via CCIP
        ICCIPSender(ccipSender).sendToEthereum(
            vaultController,
            address(weth),
            msg.value,
            msg.sender
        );

        // Calculate oLST amount
        // If _exchangeRate == 1 => 1 wei = 1 oLST
        uint256 omniTokenToTransfer = msg.value * _exchangeRate * 1e18;

        // Transfer oLST to user
        Omnitoken.safeTransfer(msg.sender, omniTokenToTransfer);

        emit Deposited(msg.sender, msg.value);
    }

    receive() external payable {}
}

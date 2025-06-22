//SPDX-License-Identifier: MIT
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

    uint256 constant DECIMAL = 1e18;

    event Deposited(
        address indexed user,
        uint256 amount
    );

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

        weth.deposit{value: msg.value}();
        IERC20(weth).safeTransfer(ccipSender, msg.value);

        ICCIPSender(ccipSender).sendToEthereum(
            vaultController,
            address(weth),
            msg.value,
            msg.sender
        );

        uint256 omniTokenToTransfer = (msg.value * _exchangeRate ) ;
        Omnitoken.safeTransfer(msg.sender, omniTokenToTransfer);


        emit Deposited(msg.sender, msg.value);
    }

    receive() external payable {}
}
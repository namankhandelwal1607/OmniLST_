// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
}

contract CCIPWithdrawalSender is Ownable {
    using SafeERC20 for IERC20;

    error NotEnoughFee(uint256 currentBalance, uint256 requiredFee);
    error ETHTransferFailed();

    IRouterClient public ccipRouter;
    address public receiverOnMainnet;
    uint64 public ethereumSelector;
    IWETH public immutable WETH;

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        uint256 amountSent,
        uint256 fees
    );

    constructor(
        address _router,
        address _receiver,
        uint64 _selector,
        address _weth,
        address _owner
    ) Ownable() {
        _transferOwnership(_owner);
        ccipRouter = IRouterClient(_router);
        receiverOnMainnet = _receiver;
        ethereumSelector = _selector;
        WETH = IWETH(_weth);
    }

    /// @notice Accepts ETH, wraps it to WETH, and sends it via CCIP to the destination chain.
    function sendETHToEthereum(address _user) external payable  {
        uint256 amount = msg.value;
        require(amount > 0, "Amount must be greater than 0");

        // Wrap ETH into WETH
        WETH.deposit{value: amount}();

        // Build CCIP message
        Client.EVM2AnyMessage memory message = _buildCCIPMessage(
            receiverOnMainnet,
            address(WETH),
            amount,
            address(0),
            _user
        );

        // Get required fee
        uint256 fee = ccipRouter.getFee(ethereumSelector, message);
        if (fee > address(this).balance)
            revert NotEnoughFee(address(this).balance, fee);

        // Approve router to transfer WETH
        IERC20(address(WETH)).approve(address(ccipRouter), amount);

        // Send message and token
        bytes32 messageId = ccipRouter.ccipSend{value: fee}(
            ethereumSelector,
            message
        );

        emit MessageSent(messageId, ethereumSelector, receiverOnMainnet, amount, fee);
    }

    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeToken,
        address _user
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({token: _token, amount: _amount});

        return Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: abi.encode(_user, _amount),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 200_000,
                    allowOutOfOrderExecution: true
                })
            ),
            feeToken: _feeToken
        });
    }

    function estimateFeeForETHSend(address _user, uint256 _amount)
        external
        view
        returns (uint256)
    {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({token: address(WETH), amount: _amount});

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverOnMainnet),
            data: abi.encode(_user, _amount),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({gasLimit: 200_000, allowOutOfOrderExecution: true})
            ),
            feeToken: address(0)
        });

        return ccipRouter.getFee(ethereumSelector, message);
    }

    function updateReceiver(address _newReceiver) external onlyOwner {
        receiverOnMainnet = _newReceiver;
    }

    function updateChainSelector(uint64 _newSelector) external onlyOwner {
        ethereumSelector = _newSelector;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
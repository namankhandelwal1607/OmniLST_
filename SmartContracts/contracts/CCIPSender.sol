//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

contract CCIPSender is Ownable {
    using SafeERC20 for IERC20;

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.

    IRouterClient public ccipRouter;
    address public receiverOnMainnet;
    uint64 public ethereumSelector;

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        uint256 fees
    );

    constructor(
        address _router,
        address _receiver,
        uint64 _selector,
        address _owner
    ) Ownable() {
        _transferOwnership(_owner);
        ccipRouter = IRouterClient(_router);
        receiverOnMainnet = _receiver;
        ethereumSelector = _selector;
    }

    function sendToEthereum(
        address _receiver,
        address _token,
        uint256 _amount,
        address _user
    ) external  {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0),
            _user
        );

        uint256 fee = ccipRouter.getFee(ethereumSelector, evm2AnyMessage);
        if (fee > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fee);

        IERC20(_token).approve(address(ccipRouter), _amount);

        bytes32 messageId = ccipRouter.ccipSend{value: fee}(
            ethereumSelector,
            evm2AnyMessage
        );

        emit MessageSent(messageId, ethereumSelector, receiverOnMainnet, fee);
    }

    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress,
        address _user
    ) private pure returns (Client.EVM2AnyMessage memory) {
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver),
                data: abi.encode(_user, _amount),
                tokenAmounts: tokenAmounts,
                extraArgs: Client._argsToBytes(
                    Client.GenericExtraArgsV2({
                        gasLimit: 200_000,
                        allowOutOfOrderExecution: true
                    })
                ),
                feeToken: _feeTokenAddress
            });
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

    function estimateFee(bytes memory metadata)
        external
        view
        returns (uint256)
    {
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](0);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverOnMainnet),
            data: metadata,
            tokenAmounts: tokenAmounts,
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            )
        });

        return ccipRouter.getFee(ethereumSelector, message);
    }

    receive() external payable {}
}
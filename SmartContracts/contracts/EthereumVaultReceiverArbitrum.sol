//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint256) external;
}

interface ILidoAdapter {
    function stakeETH() external payable;
}

interface IRocketPoolAdapter {
    function stakeETH() external payable;
}

interface IStaderAdapter {
    function stakeETH() external payable;
}

contract EthereumVaultReceiverArbitrum is CCIPReceiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IWETH public immutable weth;
    ILidoAdapter public lidoAdapter;
    IRocketPoolAdapter public rocketPoolAdapter;
    IStaderAdapter public staderAdapter;
    address tokenAddress;
    IERC20 public immutable stETH;
    IERC20 public immutable rETH;
    IERC20 public immutable lsETH;
    address public recipient;
    // Mapping to track allowed source chains
    mapping(uint64 => bool) public allowedSourceChains;

    // Mapping to track allowed senders
    mapping(address => bool) public allowedSenders;

    // Store user deposits
    mapping(address => uint256) public userDeposits;

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address user,
        uint256 amount
    );

    event ETHReceived(address indexed user, uint256 amount);
    event ETHStaked(address indexed user, uint256 amount);
    event AllowedSenderUpdated(address indexed sender, bool allowed);
    event AllowedChainUpdated(uint64 indexed chainSelector, bool allowed);
    event RecipientUpdated(
        address indexed oldRecipient,
        address indexed newRecipient
    );

    constructor(
        address _router,
        address _tokenAddress,
        address _owner,
        address _lidoAdapter,
        address _rocketPoolAdapter,
        address _staderAdapter,
        address _stETH,
        address _rETH,
        address _lsETH,
        address _recipient
    ) CCIPReceiver(_router) Ownable() {
        _transferOwnership(_owner);
        tokenAddress = _tokenAddress;
        weth = IWETH(_tokenAddress);
        lidoAdapter = ILidoAdapter(_lidoAdapter);
        rocketPoolAdapter = IRocketPoolAdapter(_rocketPoolAdapter);
        staderAdapter = IStaderAdapter(_staderAdapter);
        stETH = IERC20(_stETH);
        rETH = IERC20(_rETH);
        lsETH = IERC20(_lsETH);
        recipient = _recipient;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        bytes32 messageId = any2EvmMessage.messageId;
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector;
        address sender = abi.decode(any2EvmMessage.sender, (address));
        IERC20 token = IERC20(tokenAddress);

        require(
            allowedSourceChains[sourceChainSelector],
            "Source chain not allowed"
        );
        require(allowedSenders[sender], "Sender not allowed");

        (address user, uint256 amount) = abi.decode(
            any2EvmMessage.data,
            (address, uint256)
        );

        if (any2EvmMessage.destTokenAmounts.length > 0) {
            for (
                uint256 i = 0;
                i < any2EvmMessage.destTokenAmounts.length;
                i++
            ) {
                Client.EVMTokenAmount memory tokenAmount = any2EvmMessage
                    .destTokenAmounts[i];

                if (tokenAmount.token == tokenAddress) {
                    weth.withdraw(tokenAmount.amount);
                    emit ETHReceived(user, tokenAmount.amount);
                }
            }
        }

        emit MessageReceived(
            messageId,
            sourceChainSelector,
            sender,
            user,
            amount
        );
    }

    function stakeUserFunds(
        address user,
        uint256 lidoPercent,
        uint256 rocketPercent
    ) external nonReentrant {
        require(lidoPercent + rocketPercent <= 100, "Invalid percentages");

        uint256 totalAmount = address(this).balance;
        require(totalAmount > 0, "No ETH to stake");
        // Split amounts
        uint256 lidoAmount = (totalAmount * lidoPercent) / 100;
        uint256 rocketAmount = (totalAmount * rocketPercent) / 100;
        uint256 staderAmount = totalAmount - lidoAmount - rocketAmount;

        // Stake via adapters
        if (lidoAmount > 0) {
            lidoAdapter.stakeETH{value: lidoAmount}();
            emit ETHStaked(user, lidoAmount);
        }

        if (rocketAmount > 0) {
            rocketPoolAdapter.stakeETH{value: rocketAmount}();
            emit ETHStaked(user, rocketAmount);
        }

        if (staderAmount > 0) {
            staderAdapter.stakeETH{value: staderAmount}();
            emit ETHStaked(user, staderAmount);
        }

        uint256 sBal = stETH.balanceOf(address(this));
        if (sBal > 0) stETH.safeTransfer(recipient, sBal);

        uint256 rBal = rETH.balanceOf(address(this));
        if (rBal > 0) rETH.safeTransfer(recipient, rBal);

        uint256 lsBal = lsETH.balanceOf(address(this));
        if (lsBal > 0) lsETH.safeTransfer(recipient, lsBal);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // function processWETH(uint256 amount) external onlyOwner {
    //     require(
    //         weth.balanceOf(address(this)) >= amount,
    //         "Insufficient WETH balance"
    //     );
    //     weth.withdraw(amount);
    // }

    function setAllowedSourceChain(
        uint64 chainSelector,
        bool allowed
    ) external onlyOwner {
        allowedSourceChains[chainSelector] = allowed;
        emit AllowedChainUpdated(chainSelector, allowed);
    }

    function setAllowedSender(address sender, bool allowed) external onlyOwner {
        allowedSenders[sender] = allowed;
        emit AllowedSenderUpdated(sender, allowed);
    }

    function setRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        emit RecipientUpdated(recipient, newRecipient);
        recipient = newRecipient;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}

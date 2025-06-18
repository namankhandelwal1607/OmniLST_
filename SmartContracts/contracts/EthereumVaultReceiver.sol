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

contract EthereumVaultReceiver is CCIPReceiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IWETH public immutable weth;
    ILidoAdapter public lidoAdapter;
    IRocketPoolAdapter public rocketPoolAdapter;
    IStaderAdapter public staderAdapter;
    address tokenAddress;

    // Mapping to track allowed source chains
    mapping(uint64 => bool) public allowedSourceChains;

    // Mapping to track allowed senders
    mapping(address => bool) public allowedSenders;

    // Store user deposits
    mapping(address => uint256) public userDeposits;
    mapping(address => DepositInfo) public userDepositInfo;

    struct DepositInfo {
        uint256 totalAmount;
        uint256 timestamp;
        bool isStaked;
    }

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

    constructor(
        address _router,
        address _tokenAddress,
        address _owner,
        address _lidoAdapter,
        address _rocketPoolAdapter,
        address _staderAdapter
    ) CCIPReceiver(_router) Ownable() {
        _transferOwnership(_owner);
        tokenAddress = _tokenAddress;
        weth = IWETH(_tokenAddress);
        lidoAdapter = ILidoAdapter(_lidoAdapter);
        rocketPoolAdapter = IRocketPoolAdapter(_rocketPoolAdapter);
        staderAdapter = IStaderAdapter(_staderAdapter);
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

                    _updateUserDeposit(user, tokenAmount.amount);

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

    function _updateUserDeposit(address user, uint256 amount) internal {
        userDeposits[user] += amount;

        userDepositInfo[user] = DepositInfo({
            totalAmount: userDeposits[user],
            timestamp: block.timestamp,
            isStaked: false
        });
    }

    function stakeUserFunds(
        address user,
        uint256 lidoPercent,
        uint256 rocketPercent
    ) external onlyOwner nonReentrant {
        require(lidoPercent + rocketPercent <= 100, "Invalid percentages");

        DepositInfo storage info = userDepositInfo[user];
        require(!info.isStaked, "Already staked");

        uint256 totalAmount = info.totalAmount;
        require(totalAmount > 0, "No ETH to stake");

        // Mark as staked
        info.isStaked = true;

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
    }

    function getUserDepositInfo(
        address user
    ) external view returns (DepositInfo memory) {
        return userDepositInfo[user];
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

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}

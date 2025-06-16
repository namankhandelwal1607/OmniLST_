// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MockRETH is ERC20, ERC20Burnable {
    address public rocketPool;

    constructor(address _rocketPool) ERC20("Rocket Pool ETH", "rETH") {
        rocketPool = _rocketPool;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == rocketPool, "Only RocketPool can mint");
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) public override {
        require(msg.sender == rocketPool, "Only RocketPool can burn");
        _burn(from, amount);
    }
}
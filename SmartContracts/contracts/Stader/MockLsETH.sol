// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MockLsETH is ERC20, ERC20Burnable {
    address public stader;

    constructor(address _stader) ERC20("Liquid Staked ETH", "LsETH") {
        stader = _stader;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == stader, "Only Stader can mint");
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) public override {
        require(msg.sender == stader, "Only Stader can burn");
        _burn(from, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MockStETH is ERC20, ERC20Burnable {
    address public lido;

    constructor(address _lido) ERC20("Staked ETH", "stETH") {
        lido = _lido;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == lido, "Only Lido can mint");
        _mint(to, amount);
    }

    // Allow Lido to burn tokens from any address (used in redeem)
    function burnFrom(address from, uint256 amount) public override {
        require(msg.sender == lido, "Only Lido can burn");
        _burn(from, amount);
    }
}
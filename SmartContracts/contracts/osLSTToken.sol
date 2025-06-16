// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OsLSTToken is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    Ownable,
    ReentrancyGuard
{
    /* -------------------------------------------------------------------------- */
    /*                               State storage                                */
    /* -------------------------------------------------------------------------- */

    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public authorizedBurners;

    uint256 public immutable maxSupply;
    uint256 public exchangeRate;
    uint256 public constant RATE_PRECISION = 1e18;

    /* -------------------------------------------------------------------------- */
    /*                                    Events                                  */
    /* -------------------------------------------------------------------------- */

    event MinterUpdated(address indexed minter, bool authorized);
    event BurnerUpdated(address indexed burner, bool authorized);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event TokensMinted(address indexed to, uint256 amount, uint256 ethValue);
    event TokensBurned(address indexed from, uint256 amount, uint256 ethValue);

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        uint256 _maxSupply,
        uint256 _initialExchangeRate,
        address _owner
    ) ERC20("Omni Staked LST", "osLST") {
        require(_initialExchangeRate > 0, "Initial rate 0");

        maxSupply = _maxSupply;
        exchangeRate = _initialExchangeRate;

        // Set a custom owner (Ownable default = deployer)
        _transferOwnership(_owner);

        emit ExchangeRateUpdated(0, _initialExchangeRate);
    }

    /* -------------------------------------------------------------------------- */
    /*                            Mint / Burn logic                               */
    /* -------------------------------------------------------------------------- */

    function mint(address to, uint256 amount, uint256 ethValue)
        external
        nonReentrant
    {
        require(authorizedMinters[msg.sender], "Not minter");
        require(to != address(0), "Zero address");
        require(amount > 0, "Zero amount");
        require(totalSupply() + amount <= maxSupply, "Exceeds max");

        _mint(to, amount);
        emit TokensMinted(to, amount, ethValue);
    }

    function burnFrom(address from, uint256 amount, uint256 ethValue)
        external
        nonReentrant
    {
        require(authorizedBurners[msg.sender], "Not burner");
        require(from != address(0), "Zero address");
        require(amount > 0, "Zero amount");

        _burn(from, amount);
        emit TokensBurned(from, amount, ethValue);
    }

    /* -------------------------------------------------------------------------- */
    /*                              View / helpers                                */
    /* -------------------------------------------------------------------------- */

    function calculateTokensFromETH(uint256 ethAmount)
        external
        view
        returns (uint256)
    {
        require(exchangeRate > 0, "Rate 0");
        return (ethAmount * RATE_PRECISION) / exchangeRate;
    }

    function calculateETHFromTokens(uint256 tokenAmount)
        external
        view
        returns (uint256)
    {
        require(exchangeRate > 0, "Rate 0");
        return (tokenAmount * exchangeRate) / RATE_PRECISION;
    }

    function getTotalValueLocked() external view returns (uint256) {
        return (totalSupply() * exchangeRate) / RATE_PRECISION;
    }

    function getUserStakeValue(address user) external view returns (uint256) {
        return (balanceOf(user) * exchangeRate) / RATE_PRECISION;
    }

    /* -------------------------------------------------------------------------- */
    /*                           Owner‑only controls                              */
    /* -------------------------------------------------------------------------- */

    function updateExchangeRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate 0");
        uint256 old = exchangeRate;
        exchangeRate = newRate;
        emit ExchangeRateUpdated(old, newRate);
    }

    function setAuthorizedMinter(address minter, bool auth) external onlyOwner {
        require(minter != address(0), "Zero address");
        authorizedMinters[minter] = auth;
        emit MinterUpdated(minter, auth);
    }

    function setAuthorizedBurner(address burner, bool auth) external onlyOwner {
        require(burner != address(0), "Zero address");
        authorizedBurners[burner] = auth;
        emit BurnerUpdated(burner, auth);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /* -------------------------------------------------------------------------- */
    /*                     Hooks (resolve multiple inheritance)                   */
    /* -------------------------------------------------------------------------- */

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /* -------------------------------------------------------------------------- */
    /*                         Metadata (decimals override)                       */
    /* -------------------------------------------------------------------------- */

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

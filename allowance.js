//console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");
//-----------------------<enter code below>--------------------------------------

const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, AccountId, TransferTransaction } = require("@hashgraph/sdk");


async function main() {

     const myAccountId = AccountId.fromString("0.0.4579906");
     const myPrivateKey = PrivateKey.fromString("3030020100300706052b8104000a04220420299e4821ba1db8c2ea0439ba70e37e2e817175422ea1b91a70f8f17922cb942c");

     const client = Client.forTestnet()

     client.setOperator(myAccountId, myPrivateKey);

     //Create new keys
     const newAccountPrivateKey = PrivateKey.generateED25519();
     const newAccountPublicKey = newAccountPrivateKey.publicKey;

     //Create a new account with 1,000 tinybar starting balance
     const newAccount = await new AccountCreateTransaction()
          .setKey(newAccountPublicKey)
          .setInitialBalance(Hbar.fromTinybars(100))
          .execute(client);

     // Get the new account ID
     const getReceipt = await newAccount.getReceipt(client);
     const newAccountId = getReceipt.accountId;

     console.log("new account id", newAccountId.toString());

     //Create the transfer transaction
     const sendHbar = await new TransferTransaction()
          .addHbarTransfer(myAccountId, Hbar.fromTinybars(-100)) //Sending account
          .addHbarTransfer(newAccountId, Hbar.fromTinybars(100)) //Receiving account
          .execute(client);

     //Verify the transaction reached consensus
     const transactionReceipt = await sendHbar.getReceipt(client);
     console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

     //Request the cost of the query
     const queryCost = await new AccountBalanceQuery()
          .setAccountId(newAccountId)
          .getCost(client);

     console.log("The cost of query is: " + queryCost);

     // //Check the new account's balance
     const getNewBalance = await new AccountBalanceQuery()
          .setAccountId(newAccountId)
          .execute(client);

     console.log("The account balance after the transfer is: " + getNewBalance.hbars.toTinybars() + " tinybar.")
}

main();

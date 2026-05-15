# Assignment 1

setup : no special set up but just need import const wallet = require("./yourModuleFileName"); into javascript file . 

By the way for this module uses SGD as the main currency. All exchange rates are based on SGD, so other currencies are converted using SGD as the base.

### Calling functions 
1. **Adding User** 
- creates a new user account 

    wallet.addUser("Tae", "S1234567A");

    parameters required: name (string), idNumber (string) 

2. **Link Bank Account**  
- link a bank to the user

    wallet.linkBankAccount("Tae", "DBS");*

    parameters required: name (string), bankName (string)

3. **Get Exchange Rate** 
- show exchange rate for a currency

    wallet.getExchangeRate("USD");

    parameters required: currency (string)

4. **Top-Up Wallet** 
- add money into user's wallet

    wallet.topUpWallet("Tae", 100);

    parameters required: name (string), amount (int)

5. **Process Payment** 
- when user makes a payment locally 

    wallet.processPayment("Tae", 20);

    parameters required: name (string), amount (int)

6. **Smart Exchange** 
- automatically converts SGD to foreign currency when there is not enough foreign currency balance 

    wallet.smartExchange("Tae", 50, "USD");

    parameters required: name (string), amount (int), currency (string)

7. **Overseas Transfer** 
-  send money in our own currency ( SGD ) overseas, and they will receive it in their own local currency 


    wallet.overSeasTransfer("Tae", "Min", 50, "USD", "Bank Transfer");

    parameters required: fromUser (string), toUser (string), amountSGD(int), toCurrency (string), receiveMethod (string)

7. **Generate Transaction Statement** 
-  send money in our own currency ( SGD ) overseas, and they will receive it in their own local currency 
- i do new date so the current date is automatically generated when testing the transaction statement

    const startDate = new Date().toISOString();
    const endDate = new Date().toISOString();

    wallet.generateTransactionStatement(
    "Ali",
    "SGD",
    startDate,
    endDate
    );

    parameters required: name (string), currency (string), startDate (string), endDate (string)

# References

- referred to this to understand how the functions work and how users (should) use the app : https://www.you.co/sg/youtrip-transfer-overseas/ and https://support.you.co/hc/en-us/categories/360000059893-YouTrip-FAQs 

- used this as a reference to understand how YouTrip transaction statements are usually shown and structured. : https://share.google/xYYL3RBwYMQr4Olvb

- when searching for a web reference related to the finance industry : https://www.innreg.com/blog/top-fintech-companies-in-singapore

- when searching how to format money values properly (2 decimal places, readable format). : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

- when searching how to display it nicely in a table. https://developer.mozilla.org/en-US/docs/Web/API/console/table_static

- used AI to help me understand how fintech apps usually display transaction statements, especially how dates and records are structured.



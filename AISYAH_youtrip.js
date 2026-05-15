
module.exports = {
    wallets: [],
    transactions: [],
    exchangeRates: {
        USD_SGD: 1.35,
        JPY_SGD: 0.009,
        KRW_SGD: 0.001
    },

    // NOT PART OF THE MAIN FUNCTIONS BY THE WAY  
    findUser(name) { // find user wallet
        return this.wallets.find(wallet => wallet.name === name);
    },
    formatMoney(amount) { // money format 
        return amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    // MAIN FUNCTIONS STARTS HERE: 

    // adds user 
    addUser(name, idNumber) {
        let user = this.findUser(name);
        if (user) return "User already exists.";

        const newUser = {
            name: name,
            idNumber: idNumber,
            balance: 0,
            accountStatus: "APPROVED",
            virtualCardIssued: true,
            bankAccount: null,
            dateJoined: new Date().toISOString()
        };

        this.wallets.push(newUser);
        return `Account for ${name} is now ${newUser.accountStatus}. Virtual card is ready for use!`;
    },

    // link bank account 
    linkBankAccount(name, bankName) {
        let user = this.findUser(name);

        if (!user) return "User not found";
        if (user.bankAccount) return "Account already linked to " + user.bankAccount;

        const supportedBanks = ['DBS', 'POSB', 'OCBC', 'UOB', 'HSBC', 'Standard Chartered'];

        if (!supportedBanks.includes(bankName)) return "Bank not supported";

        user.bankAccount = bankName;

        this.transactions.push({
            name: name,
            type: "ACCOUNT_ACTION",
            action: "BANK_LINK",
            bank: bankName,
            date: new Date().toISOString()
        });

        return `Success: ${bankName} is now linked to ${name}'s account.`;
    },

    // get exchange rate 
    getExchangeRate(currency) {
        const rate = this.exchangeRates[`${currency.toUpperCase()}_SGD`];
        if (!rate) {
            return 'Exchange rate not available';
        }
        return `1 ${currency.toUpperCase()} = ${rate} SGD`;
    },

    // add money into user's wallet 
    topUpWallet(name, amount) {
        let user = this.findUser(name);
        if (!user) return 'User not found';

        user.balance += amount;

        this.transactions.push({
            name: name,
            type: 'TOP_UP',
            moneyIn: this.formatMoney(amount),
            moneyOut: 0,
            currency: 'SGD',
            balanceAfter: this.formatMoney(user.balance),
            date: new Date().toISOString()
        });
        return `Top-up successful! New balance for ${name}: ${this.formatMoney(user.balance)} SGD`;
    },

    // payment action when paying in local country 
    processPayment(name, amount) {
        let user = this.findUser(name);
        if (!user) return 'User not found'
        if (user.balance < amount) return 'Insufficient balance';

        user.balance -= amount;

        this.transactions.push({
            name: name,
            type: 'PAYMENT',
            moneyIn: 0,
            moneyOut: this.formatMoney(amount),
            currency: 'SGD',
            balanceAfter: this.formatMoney(user.balance),
            date: new Date().toISOString()
        })

        return `${amount} SGD paid successfully. Your new balance  is ${this.formatMoney(user.balance)}SGD`;
    },

    //automatically converts SGD to foreign currency when there is not enough foreign currency balance 
    smartExchange(name, amount, currency) {
        let user = this.findUser(name);
        if (!user) return 'User not found'

        const rate = this.exchangeRates[`${currency.toUpperCase()}_SGD`];
        if (!rate) {
            return 'This exchange rate is not available'
        }

        const requiredSGD = amount * rate;
        if (user.balance < requiredSGD) {
            return 'Insufficient balance';
        }

        user.balance -= requiredSGD;

        this.transactions.push({
            name: name,
            type: "SMART_EXCHANGE",
            moneyIn: 0,
            moneyOut: requiredSGD,
            currency: 'SGD',
            balanceAfter: this.formatMoney(user.balance),
            foreignAmount: this.formatMoney(amount),
            foreignCurrency: currency.toUpperCase(),
            rateUsed: rate,
            date: new Date().toISOString()
        });

        return `SmartExchange: Paid ${this.formatMoney(amount)} ${currency.toUpperCase()} (${this.formatMoney(requiredSGD)} SGD)`;

    },

    // send money in our own currency ( SGD ) overseas, and they will receive it in their own local currency 
    overSeasTransfer(fromUser, toUser, amountSGD, toCurrency, receiveMethod) {
        let sender = this.findUser(fromUser);
        if (!sender) return 'User not found'
        if (sender.balance < amountSGD) return 'Insufficient balance'

        sender.balance -= amountSGD;

        const rate = this.exchangeRates[`${toCurrency.toUpperCase()}_SGD`];
        if (!rate) return 'Exchange rate not available';

        const foreignAmount = amountSGD / rate;

        this.transactions.push({
            name: fromUser,
            from: fromUser,
            to: toUser,
            type: "OVERSEAS_TRANSFER",
            moneyIn: 0,
            moneyOut: this.formatMoney(amountSGD),
            currency: 'SGD',
            balanceAfter: this.formatMoney(sender.balance),
            foreignAmount: this.formatMoney(foreignAmount),
            foreignCurrency: toCurrency,
            method: receiveMethod,
            rateUsed: rate,
            date: new Date().toISOString()
        });

        return `Transfer Sent: ${fromUser} sent ${this.formatMoney(foreignAmount)} ${toCurrency.toUpperCase()} (${this.formatMoney(amountSGD)} SGD) to ${toUser}\n${fromUser} new balance is ${this.formatMoney(sender.balance)}`;
    },

    // show user their YouTrip transaction statements
    generateTransactionStatement(name, currency, startDate, endDate) {

        let user = this.findUser(name);
        if (!user) return 'User not found';

        const searchCurrency = currency ? currency.toUpperCase() : 'SGD';

        const start = new Date(startDate);
        const end = new Date(endDate)

        const diffInTime = end.getTime() - start.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        if (diffInDays > 31) {
            return "Error: Statement range cannot exceed 31 days.";
        }
        if (diffInDays < 0) {
            return "Error: End date cannot be before start date.";
        }

        function transactionMatch(transaction) {
            const isUser = transaction.name === name || transaction.from === name;
            const isCurrency = transaction.currency === searchCurrency;
            const isWithinDate = transaction.date >= startDate && transaction.date <= endDate;

            return isUser && isCurrency && isWithinDate;
        }

        const matchedTransactions =
            this.transactions.filter(transactionMatch);

        if (matchedTransactions.length === 0) {
            return `No transactions found for ${searchCurrency} in this period.`;
        }

        console.table(matchedTransactions);
        return `Transaction statement for ${name} generated successfully.`;

    },

}
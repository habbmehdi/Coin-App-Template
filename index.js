const fs = require('fs')
const path = require('path')
const merge = require('deepmerge')
const stringify = require('fast-stable-stringify')
const {shardusFactory} = require('@shardus/core')
const crypto = require('@shardus/crypto-utils')

crypto.init('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347')

const overwriteMerge = (target, source, options) => source

let config = { server: { baseDir: './' } }

if (fs.existsSync(path.join(process.cwd(), 'config.json'))) {
  const fileConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json')))
  config = merge(config, fileConfig, { arrayMerge: overwriteMerge })
}

if (process.env.BASE_DIR) {
  const baseDirFileConfig = JSON.parse(fs.readFileSync(path.join(process.env.BASE_DIR, 'config.json')))
  config = merge(config, baseDirFileConfig, { arrayMerge: overwriteMerge })
  config.server.baseDir = process.env.BASE_DIR
}

if (process.env.APP_SEEDLIST) {
  config = merge(
    config,
    {
      server: {
        p2p: {
          existingArchivers: [
            {
              ip: process.env.APP_SEEDLIST,
              port: 4000,
              publicKey: '758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3',
            },
          ],
        },
      },
    },
    { arrayMerge: overwriteMerge }
  )
}

if (process.env.APP_MONITOR) {
  config = merge(
    config,
    {
      server: {
        reporting: {
          recipient: `http://${process.env.APP_MONITOR}:3000/api`,
        },
      },
    },
    { arrayMerge: overwriteMerge }
  )
}

if (process.env.APP_IP) {
  config = merge(
    config,
    {
      server: {
        ip: {
          externalIp: process.env.APP_IP,
          internalIp: process.env.APP_IP,
        },
      },
    },
    { arrayMerge: overwriteMerge }
  )
}

// Setting minNodesToAllowTxs to 1 to allow single node networks
config = merge(config, {
  server: {
    p2p: {
      minNodesToAllowTxs: 1
    }
  }
})

const dapp = shardusFactory(config)

// our in-memory database
let accounts = {}

dapp.registerExternalPost('inject', async(req, res) => {
  console.log(req.body)
  try{
    const response = dapp.put(req.body)
    res.json(response)
  }catch(e){
    res.json(e)
  }
})
dapp.registerExternalGet('account/:id', async(req, res) => {
  const id = req.params['id']
  const account = accounts[id]
  res.json(account)
})

dapp.registerExternalGet('accounts', async(req,res) => {
  res.json(accounts)
})

dapp.setup({
validate(tx){
    // Validate tx fields here
    let success = true
    let reason = ''
    const txnTimestamp = tx.timestamp

    if (typeof tx.tx.type !== 'string') {
      success = false
      reason = '"type" must be a string.'
      throw new Error(reason)
    }
    if (typeof tx.tx.from !== 'string') {
      success = false
      reason = '"from" must be a string.'
      throw new Error(reason)
    }
    if (typeof tx.tx.to !== 'string') {
      success = false
      reason = '"to" must be a string.'
      throw new Error(reason)
    }
    if (typeof tx.tx.amount !== 'number') {
      success = false
      reason = '"amount" must be a number.'
      throw new Error(reason)
    }
    if (typeof tx.tx.timestamp !== 'number') {
      success = false
      reason = '"timestamp" must be a number.'
      throw new Error(reason)
    }

    return {
      success,
      reason,
      txnTimestamp,
    }
  },
  apply(tx, wrappedStates){
    const txId = crypto.hashObj(tx.tx)
    const txTimestamp = tx.tx.timestamp

    console.log('DBG', 'attempting to applytx', txId, '...')
    const applyResponse = dapp.createApplyResponse(txId, txTimestamp)

      // Apply the tx
      switch (tx.tx.type) {
        case 'create': {
          // Get the to account
          const to = wrappedStates[tx.tx.to].data
          if (typeof to === 'undefined' || to === null) {
            throw new Error(`account '${tx.tx.to}' missing. tx: ${JSON.stringify(tx)}`)
          }
          // Increment the to accounts balance
          to.data.balance += tx.tx.amount
          // Update the to accounts timestamp
          to.timestamp = txTimestamp
          console.log('DBG', 'applied create tx', txId, accounts[tx.tx.to])
          break
        }
        case 'transfer': {
          // Get the from and to accounts
          const from = wrappedStates[tx.tx.from].data
          if (typeof from === 'undefined' || from === null) {
            throw new Error(`from account '${tx.tx.from}' missing. tx: ${JSON.stringify(tx)}`)
          }
          const to = wrappedStates[tx.tx.to].data
          if (typeof to === 'undefined' || to === null) {
            throw new Error(`to account '${tx.tx.to}' missing. tx: ${JSON.stringify(tx)}`)
          }
          // Decrement the from accounts balance
          from.data.balance -= tx.tx.amount
          // Increment the to accounts balance
          to.data.balance += tx.tx.amount
          // Update the from accounts timestamp
          from.timestamp = txTimestamp
          // Update the to accounts timestamp
          to.timestamp = txTimestamp
          console.log('DBG', 'applied transfer tx', txId, accounts[tx.tx.from], accounts[tx.tx.to])
          break
        }
      }
    return applyResponse
  },
  crack(tx){
    const keys = {
      sourceKeys: [],
      targetKeys: [],
      allKeys: [],
      timestamp: tx.tx.timestamp,
    }
    switch (tx.tx.type) {
      case 'create':
        keys.targetKeys = [tx.tx.to]
        keys.sourceKeys = [tx.tx.to]
        break
      case 'transfer':
        keys.targetKeys = [tx.tx.to]
        keys.sourceKeys = [tx.tx.from]
        break
    }
    keys.allKeys = [...keys.sourceKeys, ...keys.targetKeys]
    return {
      id: crypto.hashObj(tx),
      timestamp: tx.tx.timestamp,
      keys: keys
    }
  },
  setAccountData(accountsToSet) {
    console.log('==> setAccountData');
    accountsToSet.forEach(account => (accounts[account.id] = account));
  },
  resetAccountData(accountBackupCopies) {
    for (const recordData of accountBackupCopies) {
      const accountData = recordData.data
      accounts[accountData.id] = {...accountData}
    }
  },
  deleteAccountData(addressList) {
    console.log('==> deleteAccountData');
    addressList.forEach(address => delete accounts[address]);
  },
  deleteLocalAccountData() {
    console.log('==> deleteLocalAccountData');
    accounts = {};
  },
  getRelevantData(accountId, tx) {
    console.log('==> getRelevantData');
    let account = accounts[accountId];
    let accountCreated = false;

    if (!account) {
      account = {
        id: accountId,
        timestamp: tx.tx.timestamp,
        data: { balance: 0 }
      };
      accountCreated = true;
    }
    return dapp.createWrappedResponse(
      accountId,
      accountCreated,
      crypto.hashObj(account),
      account.timestamp,
      account
    );
  },
  getAccountData(accountIdStart, accountIdEnd, maxRecords) {
    console.log('==> getAccountData');
    const wrappedAccounts = [];
    const start = parseInt(accountIdStart, 16);
    const end = parseInt(accountIdEnd, 16);

    for (const account of Object.values(accounts)) {
      const parsedAccountId = parseInt(account.id, 16);
      if (parsedAccountId < start || parsedAccountId > end) continue;

      const wacc = dapp.createWrappedResponse(
        account.id,
        false,
        crypto.hashObj(account),
        account.timestamp,
        account
      );

      wrappedAccounts.push(wacc);

      if (wrappedAccounts.length >= maxRecords) return wrappedAccounts;
    }
    return wrappedAccounts;
  },
  getAccountDataByRange(
    accountStart,
    accountEnd,
    dateStart,
    dateEnd,
    maxRecords
  ) {
    console.log('==> getAccountDataByRange');
    const wrappedAccounts = [];

    const start = parseInt(accountStart, 16);
    const end = parseInt(accountEnd, 16);

    for (const account of Object.values(accounts)) {
      // Skip if not in account id range
      const id = parseInt(account.id, 16);
      if (id < start || id > end) continue;

      // Skip if not in timestamp range
      const timestamp = account.timestamp;
      if (timestamp < dateStart || timestamp > dateEnd) continue;

      const wrappedAccount = dapp.createWrappedResponse(
        account.id,
        false,
        crypto.hashObj(account),
        account.timestamp,
        account
      );

      wrappedAccounts.push(wrappedAccount);

      // Return results early if maxRecords reached
      if (wrappedAccounts.length >= maxRecords) return wrappedAccounts;
    }

    return wrappedAccounts;
  },
  getAccountDataByList(addressList) {
    console.log('==> getAccountDataByList');
    const wrappedAccounts = [];

    for (const address of addressList) {
      const account = accounts[address];

      if (!account) continue;

      const wacc = dapp.createWrappedResponse(
        account.id,
        false,
        crypto.hashObj(account),
        account.timestamp,
        account
      );
      wrappedAccounts.push(wacc);
    }

    return wrappedAccounts
  },
  updateAccountFull(wrappedState, localCache, applyResponse) {
    console.log('==> updateAccountFull');
    const {accountId, accountCreated} = wrappedState;
    const updatedAccount = wrappedState.data;

    const hashBefore = accounts[accountId]
      ? crypto.hashObj(accounts[accountId])
      : '';

    const hashAfter = crypto.hashObj(updatedAccount);

    accounts[accountId] = updatedAccount;

    dapp.applyResponseAddState(
      applyResponse,
      updatedAccount,
      localCache,
      accountId,
      applyResponse.txId,
      applyResponse.txTimestamp,
      hashBefore,
      hashAfter,
      accountCreated
    );
  },getTimestampFromTransaction(inTx) { 
    return inTx.timestamp;
  },
  updateAccountPartial(wrappedState, localCache, applyResponse) {
    console.log('==> updateAccountPartial');
    this.updateAccountFull(wrappedState, localCache, applyResponse);
  },
  calculateAccountHash(account) {
    console.log('==> calculateAccountHash');
    return crypto.hashObj(account);
  },
  close() {
    console.log('Shutting down...');
  },
});

dapp.registerExceptionHandler();
dapp.start();

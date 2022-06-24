const fs = require('fs')
const { resolve } = require('path')
const path = require('path');
const vorpal = require('vorpal')()
const got = require('got')
const crypto = require('@shardus/crypto-utils')
const axios = require('axios')
crypto.init('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347')

const walletFile = resolve('./wallet.json')
let walletEntries = {}

try {
  walletEntries = require(walletFile)
} catch (e) {
  saveEntries(walletEntries, walletFile)
  console.log(`Created wallet file '${walletFile}'.`)
}

function saveEntries (entries, file) {
  const stringifiedEntries = JSON.stringify(entries, null, 2)
  fs.writeFileSync(file, stringifiedEntries)
}
function createEntry (name, id) {
  if (typeof id === 'undefined' || id === null) {
    id = crypto.hash(name)
  }
  walletEntries[name] = String(id)
  saveEntries(walletEntries, walletFile)
  return id
}

console.log(`Loaded wallet entries from '${walletFile}'.`)

let host = process.argv[2] || 'localhost:9001'

function getInjectUrl () { return `http://${host}/inject` }
function getAccountsUrl () { return `http://${host}/accounts` }
function getAccountUrl (id) { return `http://${host}/account/${id}` }

console.log(`Using ${host} as coin-app node for queries and transactions.`)

async function postJSON (url, obj) {
  const response = await got(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(obj)
  })
  return response.body
}
/**
 * interface tx {
 *   type: string
 *   from: string,
 *   to: string,
 *   amount: number,
 *   timestamp: number
 * }
 */
async function injectTx (tx = {}) {
  tx = Object.assign({
    type: 'create',
    from: 'noone',
    to: 'someone',
    amount: 1,
    timestamp: Date.now()
  }, tx)

  console.log(tx)
  try {
    const res = await postJSON(getInjectUrl(), tx)
    return res
  } catch (err) {
    return err.message
  }
}


async function getAccountData (id) {
  try {
    const res = await got(typeof id !== 'undefined' && id !== null ? getAccountUrl(id) : getAccountsUrl())
    return res.body
  } catch (err) {
    return err.message
  }
}

function createAccount(keys = crypto.generateKeypair()) {
  return {
    address: keys.publicKey,
    keys,
  };
}

function createAccounts(num) {
  // Create an empty array of size (num) and map it to a list of account keypairs
  const accounts = new Array(num).fill().map((account) => createAccount());
  return accounts;
}

async function TxSpamSetup(accounts, nodeList) { 
  for(const account of accounts){ 
    console.log(account)
    node = nodeList[Math.floor(Math.random() * nodeList.length)];
    actualTx = {
        type: 'create',
        from: '0'.repeat(64),
        to: account.address,
        amount: 999999,
        timestamp: Date.now(),
      };
    await sendTx(actualTx, node, true,nodeList)
  }
}

function makeTxGenerator(accounts, total = 0, type) {
  function* buildGenerator(txBuilder, accounts, total, type) {
    let account1, offset, account2;
    while (total > 0) {
      // Keep looping through all available accounts as the srcAcct
      account1 = accounts[total % accounts.length];
      // Pick some other random account as the tgtAcct
      offset = Math.floor(Math.random() * (accounts.length - 1)) + 1;
      account2 = accounts[(total + offset) % accounts.length];

      // Return a create tx to add funds to the srcAcct
      // yield txBuilder({ type: 'create', to: account1, amount: 1 });
      
      switch (type) {
        case 'create': {
          yield txBuilder({
            type: 'create',
            to: account1,
            amount: 9999,
          });
          break;
        }
        case 'transfer': {
          yield txBuilder({
            type: 'transfer',
            from: account1,
            to: account2,
            amount: 1,
          });
          break;
        }
        case 'message': {
          const message = stringify({
            body: 'spam1234',
            timestamp: Date.now(),
            handle: account1,
          });
          yield txBuilder({
            type: 'message',
            from: account1,
            to: account2,
            message: message,
            amount: 1,
          });
          break;
        }
        case 'toll': {
          yield txBuilder({
            type: 'toll',
            from: account1,
            toll: Math.ceil(Math.random() * 1000),
            amount: 1,
          });
          break;
        }
        default: {
          console.log('Type must be `transfer`, `message`, or `toll`');
        }
      }
      total--;
      if (!(total > 0)) break;
    }
  }
  const generator = buildGenerator(buildTx, accounts, total, type);
  generator.length = total;
  return generator;
}

function buildTx({ type, from, to, amount, message, toll }) {
  let actualTx;
  switch (type) {
    case 'create': {
      actualTx = {
        type: type,
        from: '0'.repeat(64),
        to: to.address,
        amount: Number(amount),
        timestamp: Date.now(),
      };
      break;
    }
    case 'transfer': {
      actualTx = {
        type: type,
        from: from.address,
        timestamp: Date.now(),
        to: to.address,
        amount: Number(amount),
      };
      break;
    }
    case 'message': {
      actualTx = {
        type: type,
        from: from.address,
        to: to.address,
        message: message,
        amount: Number(amount),
        timestamp: Date.now(),
      };
      break;
    }
    case 'toll': {
      actualTx = {
        type: type,
        from: from.address,
        toll: toll,
        amount: Number(amount),
        timestamp: Date.now(),
      };
      break;
    }
    default: {
      console.log('Type must be `transfer`, `message`, or `toll`');
    }
  }
  if (actualTx.type == 'create') {
    crypto.signObj(actualTx, to.keys.secretKey, to.keys.publicKey);
  }else if (from.keys){
    crypto.signObj(actualTx, from.keys.secretKey, from.keys.publicKey);
  } else {
    crypto.signObj(actualTx, to.keys.secretKey, to.keys.publicKey);
  }
  return actualTx;
}

async function getSeedNodes() {
  const res = await axios.get(`http://localhost:4000/nodelist`);
  const nodelist  = res.data;
  return nodelist.nodeList
}

async function spamTxs({ txs, rate, nodeList = [], saveFile = false, verbose = true }) {
  if (!Array.isArray(nodeList)) nodeList = [nodeList];

  //console.log(`Spamming ${nodeList.length > 1 ? 'Nodes' : 'node'} ${nodeList.ip.join()} with ${txs.length ? txs.length + ' ' : ''}txs at ${rate} TPS...`);




  const writeStream = saveFile ? fs.createWriteStream(path.join('./', saveFile)) : null;

  const promises = [];
  let node;
  let count = 0;

  for (const tx of txs) {
    let transaction = await tx;
    if (writeStream) writeStream.write(JSON.stringify(transaction, null, 2) + '\n');
    node = nodeList[Math.floor(Math.random() * nodeList.length)];
    promises.push(sendTx(await transaction, node, verbose,nodeList));
    count++;
    await _sleep((1 / rate) * 1000);
  }

  await Promise.all(promises);
  console.log('Done spamming');

  // if (writeStream) {
  //   await new Promise((resolve) => writeStream.on('finish', resolve));
  //   console.log(`Wrote spammed txs to '${saveFile}'`);
  // }


}

async function sendTx(tx, node = null, verbose = false,nodeList) {
  // console.log('tx :',tx)
  
  if (!tx.sign) {
    tx = buildTx(tx);
  }
  if (verbose) {
    console.log(`Sending tx to ${node.ip}...`);
    console.log(tx);
  }
  var { data } = await axios.post(`http://${node.ip}:${node.port}/inject`, tx);
  if (verbose) console.log('Got response:', data);

  if (data.reason == 'Node is still syncing.'){ 
    for(const txcounter=0; txcounter < 5; txcounter++ ){ 

      node = nodeList[Math.floor(Math.random() * nodeList.length)];
      
      data = await axios.post(`http://${node.ip}:${node.port}/inject`, tx);
      
      if (verbose) console.log('Try number ',txcounter,' Got response:', data);
      
      if (data.reason !== 'Node is still syncing.' && data.reason !='Not ready to accept transactions, shard calculations pending' ){ 
        break
      }
    }
  }
  return data;
}

async function _sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

vorpal
  .command(
    'spam transactions <type> <accounts> <count> <tps>',
    'spams the network with <type> transactions <count> times, with <account> number of accounts, at <tps> transactions per second'
  )
  .action(async function(args, callback) {
    const accounts = createAccounts(args.accounts);
    var txs = makeTxGenerator(accounts, args.accounts, 'create')
    const nodes = await getSeedNodes();
    console.log(nodes)
    await spamTxs({
      txs,
      rate: args.tps,
      nodeList: nodes,
      saveFile: 'spam-test.json',
    });

    txs = makeTxGenerator(accounts, args.count, args.type);
    await spamTxs({
      txs,
      rate: args.tps,
      nodeList: nodes,
      saveFile: 'spam-test.json',
    });
    this.log('Done spamming...');
    this.log('Spammed a total of ',(args.accounts),'Create transactions and ',args.count,' Transfer transactions for a total of ',args.count+args.accounts,'transactions' );
    callback();
  })

vorpal
  .command('use <host>', 'Uses the given <host> as the coin-app node for queries and transactions.')
  .action(function (args, callback) {
    host = args.host
    this.log(`Set ${args.host} as coin-app node for transactions.`)
    callback()
  })

vorpal
  .command('wallet create <name> [id]', 'Creates a wallet with the given <name> and [id]. Makes [id] = hash(<name>) if [id] is not given.')
  .action(function (args, callback) {
    if (typeof walletEntries[args.name] !== 'undefined' && walletEntries[args.name] !== null) {
      this.log(`Wallet named '${args.name}' already exists.`)
      callback()
      return
    }
    const id = createEntry(args.name, args.id)
    this.log(`Created wallet '${args.name}': '${id}'.`)
    callback()
  })

vorpal
  .command('wallet list [name]', 'Lists wallet for the given [name]. Otherwise, lists all wallets.')
  .action(function (args, callback) {
    let wallet = walletEntries[args.name]
    if (typeof wallet !== 'undefined' && wallet !== null) {
      this.log(`${JSON.stringify(wallet, null, 2)}`)
    } else {
      this.log(`${JSON.stringify(walletEntries, null, 2)}`)
    }
    callback()
  })

vorpal
  .command('tokens create <amount> <to>', 'Creates <amount> tokens for the <to> wallet.')
  .action(function (args, callback) {
    let toId = walletEntries[args.to]
    if (typeof toId === 'undefined' || toId === null) {
      toId = createEntry(args.to)
      this.log(`Created wallet '${args.to}': '${toId}'.`)
    }
    const transaction = { type: 'create', from: '0'.repeat(32), to: toId, amount: args.amount , timestamp: Date.now()}
    console.log(typeof transaction.type)
    injectTx(transaction).then((res) => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command('tokens transfer <amount> <from> <to>', 'Transfers <amount> tokens from the <from> wallet to the <to> wallet.')
  .action(function (args, callback) {
    const fromId = walletEntries[args.from]
    if (typeof fromId === 'undefined' || fromId === null) {
      this.log(`Wallet '${args.from}' does not exist.`)
      this.callback()
    }
    let toId = walletEntries[args.to]
    if (typeof toId === 'undefined' || toId === null) {
      toId = createEntry(args.to)
      this.log(`Created wallet '${args.to}': '${toId}'.`)
    }
    injectTx({ type: 'transfer', from: fromId, to: toId, amount: args.amount, timestamp: Date.now() }).then((res) => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command('config update <update> <cycle>', 'applies the <update> in the <cycle> cycle.')
  .action(function (args, callback) {

    injectTx({ type: 'configUpdate', update : {"minNodes": 5}, cycle : args.cycle , timestamp: Date.now()}).then((res) => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command('query [account]', 'Queries network data for the account associated with the given [wallet]. Otherwise, gets all network data.')
  .action(function (args, callback) {
    const accountId = walletEntries[args.account]
    this.log(`Querying network for ${accountId ? `'${args.account}' wallet data` : 'all data'}:`)
    getAccountData(accountId).then(res => {
      try {
        const parsed = JSON.parse(res)
        res = JSON.stringify(parsed, null, 2)
      } catch (err) {
        this.log('Response is not a JSON object')
      } finally {
        this.log(res)
        callback()
      }
    })
  })

vorpal
  .delimiter('client$')
  .show()

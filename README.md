# Getting Familiar with Shardus

## Setup

### Pre-install

Make sure you have the following installed and configured (we recommend using [nvm](https://github.com/nvm-sh/nvm)/[nvm-windows](https://github.com/coreybutler/nvm-windows) to manage your Node.js and npm versions):
* Node.js (10.x.x)
* npm (6.x.x)
* Git

Then, install the `node-gyp` dependencies for your platform listed [here](https://www.npmjs.com/package/node-gyp#installation).

On Ubuntu, it goes something like this:
```
$ sudo apt update && sudo apt install python2.7 make g++
$ npm config set python python2.7
```

### Install

```
$ npm i -g git+https://gitlab.com/shardus/enterprise/tools/shardus-cli.git
$ shardus init myApp https://gitlab.com/shardus/enterprise/applications/coin-app-template.git
$ cd myApp
```

## Iterate on a single node

1. Make code changes to `index.js` and / or `client.js`

2. Start the `seed-node-server`, `monitor-server`, and your `index.js` server:

    ```
    $ npm start
    ```

3. Interact with your `index.js` server:

    ```
    $ node client.js
    $ client$ help
    ...
    ```

4. Stop the `seed-node-server` and `monitor-server`, and clean residual run files:

    ```
    $ npm stop && npm run clean
    ```

Repeat until desired behavior is achieved...

## Test a network of nodes

1. Create a local test network with multiple instances of your `index.js` server:

    ```
    $ shardus network create --default
    (uses default settings for prompts)...
    $ cd instances
    ```

2. Start your local test network:

    ```
    $ shardus network start
    ```

3. Interact with your network:

    ```
    $ node ../client.js
    $ client$ help
    ...
    ```

4. Stop the network:

   ```
   $ shardus network stop
   ```

5. Clean databases and logs from the last run:

   ```
   $ shardus network clean
   ```

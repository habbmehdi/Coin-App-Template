export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" 
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 

nvm use 16.11.1 

git clone https://github.com/habbmehdi/Coin-App-Template.git

cd Coin-App-Template

echo "Y" | sudo apt-get install jq

myip=$(curl ifconfig.me)

sudo jq -n --arg myip "$myip" '{ "server":  { "p2p": { "existingArchivers": [{"ip": "70.81.221.194","port": 4000,"publicKey": "758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"}],"cycleDuration": 60,"minNodes": 200,"maxNodes": 200,"maxJoinedPerCycle": 100,"maxSyncingPerCycle": 100,"maxRotatedPerCycle": 0, "minNodesToAllowTxs": 25,"amountToGrow": 0, "amountToShrink": 0}, "ip": {"externalIp": $myip,"externalPort": 9001,"internalIp": $myip,"internalPort": 9005},"network" : { "timeout": 5 },"reporting": {"report": true,"recipient": "http://70.81.221.194:3000/api"},"loadDetection": {"queueLimit": 100000,"desiredTxTime": 60,"highThreshold": 0.9,"lowThreshold": 0.2},"rateLimiting": {"limitRate": false},"sharding": {"nodesPerConsensusGroup": 5}}}' > config.json

# sudo jq -n --arg myip "$myip" '{ "server":  { "p2p": { "existingArchivers": [{"ip": "70.81.221.194","port": 4000,"publicKey": "758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"}],"keptCerts": 9,"certMatches": 9,"cycleDuration": 60,"minNodes": 200,"maxNodes": 200,"maxJoinedPerCycle": 100,"maxSyncingPerCycle": 100,"maxRotatedPerCycle": 0, "minNodesToAllowTxs": 25,"amountToGrow": 0, "amountToShrink": 0}, "ip": {"externalIp": $myip,"externalPort": 9001,"internalIp": $myip,"internalPort": 9005},"network" : { "timeout": 2 },"reporting": {"report": true,"recipient": "http://70.81.221.194:3000/api"},"loadDetection": {"queueLimit": 100000,"desiredTxTime": 60,"highThreshold": 0.9,"lowThreshold": 0.2},"rateLimiting": {"limitRate": false},"sharding": {"nodesPerConsensusGroup": 5}}}' > config.json

# sudo jq -n --arg myip "$myip" '{ "server":  { "p2p": { "existingArchivers": [{"ip": "70.81.221.194","port": 4000,"publicKey": "758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"}],"keptCerts": 9,"certMatches": 9,"cycleDuration": 60,"minNodes": 200,"maxNodes": 200,"maxJoinedPerCycle": 100,"maxSyncingPerCycle": 100,"maxRotatedPerCycle": 0, "minNodesToAllowTxs": 25,"amountToGrow": 0, "amountToShrink": 0},"malicious": {"colludingQ3": true, "colludingQ4" : true, "numNodes": 75}, "ip": {"externalIp": $myip,"externalPort": 9001,"internalIp": $myip,"internalPort": 9005}, "network" : { "timeout": 2 },"reporting": {"report": true,"recipient": "http://70.81.221.194:3000/api"},"loadDetection": {"queueLimit": 100000,"desiredTxTime": 60,"highThreshold": 0.9,"lowThreshold": 0.2},"rateLimiting": {"limitRate": false},"sharding": {"nodesPerConsensusGroup": 5}}}' > config.json

# echo [ENTER] | sudo apt install python2.7 make g++

npm config set python python3.9

npm install

sudo rm -r ~/Coin-App-Template/node_modules/@shardus/core/dist

# sudo mv ./Mal/dist ./node_modules/@shardus/core/dist

# sudo mv ./2.6.20/dist ./node_modules/@shardus/core/dist

sudo mv ./2.6.28 ./node_modules/@shardus/core/dist

npm install pm2@latest -g

pm2 start index.js
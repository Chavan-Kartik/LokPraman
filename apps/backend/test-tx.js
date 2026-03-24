const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const wallet = new ethers.Wallet('f680153c61ab06142793c999540824e28af0a2b1d10d91d83cb3fa251d91b79f', provider);
const contractAddress = '0xe66f6aD794AB15A0c76c8Efb530A3b637Edf8823';

const abiPath = path.join(__dirname, 'dist', 'contracts', 'abi', 'TaskEscrow.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

const contract = new ethers.Contract(contractAddress, abi, wallet);

async function test() {
    try {
        const taskId = "task_" + Date.now();
        const taskIdHash = ethers.keccak256(ethers.toUtf8Bytes(taskId));
        const clientAddress = wallet.address;
        const amountINR = 1000;
        const stripePaymentIntentId = "stripe_pending";
        console.log("sending tx...")
        const tx = await contract.recordTaskCreation(
            taskIdHash,
            clientAddress,
            amountINR, // This could be the float value issue!
            stripePaymentIntentId
        );
        console.log("tx sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("tx mined:", receipt.hash);
    } catch(e) {
        console.error("Error:", e);
    }
}
test();

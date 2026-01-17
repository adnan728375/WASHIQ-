// বর্তমান ফাংশনগুলো সরিয়ে দিন:
function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(balanceFile));
  if (data[userID]?.balance != null) return data[userID].balance;
  return userID === "100078049308655" ? 10000 : 100;
}

function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(balanceFile));
  data[userID] = { balance };
  fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
}

// পরিবর্তে সরাসরি usersData ব্যবহার করুন:
module.exports.onStart = async function ({ api, event, args, usersData }) {
  const { senderID, threadID, messageID } = event;

  try {
    // এভাবে ব্যালেন্স নিন
    const userData = await usersData.get(senderID);
    let balance = userData.money;
    
    // ... বাকি কোড ...
    
    // ব্যালেন্স আপডেট করুন
    await usersData.set(senderID, {
      money: newBalance
    });
    
    // setBalance() কল আর দরকার নেই
  } catch (error) {
    // error handling
  }
};

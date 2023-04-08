const noblox = require('noblox.js');
const auth = require('../auth.json');
const config = require('../config.json');

// Login to the Roblox API with the stored token
noblox.setCookie(auth.token);

// Get the user's username
async function getUsername(userId) {
  try {
    const username = await noblox.getUsernameFromId(userId);
    return username;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Get the user's rank in the group
async function getRank(userId) {
  try {
    const rank = await noblox.getRankInGroup(config.groupId, userId);
    return rank;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Set the user's rank in the group
async function setRank(userId, rank) {
  try {
    await noblox.setRank(config.groupId, userId, rank);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  getUsername,
  getRank,
  setRank,
};

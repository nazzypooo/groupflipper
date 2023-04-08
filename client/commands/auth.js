const noblox = require('noblox.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const auth = require('../auth.json');

module.exports = {
  name: 'auth',
  description: 'Authenticate with your Roblox account using your token.',
  execute(message, args) {
    // Check if the user is already authenticated
    if (auth[message.author.id]) {
      message.reply('you are already authenticated!');
      return;
    }

    // Prompt the user to enter their token
    message.reply('please enter your Roblox token.');

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 30000 });

    collector.on('collect', async m => {
      const token = m.content.trim();

      try {
        // Verify the token with the Roblox API
        const user = await noblox.setCookie(token);
        const groupMembership = await noblox.getRankInGroup(groupId, user.userId);
        if (groupMembership === 0) {
          message.reply('you are not a member of the required group.');
          collector.stop();
          return;
        }

        // Hash and store the token
        const hashedToken = await bcrypt.hash(token, 10);
        auth[message.author.id] = hashedToken;
        fs.writeFileSync('./auth.json', JSON.stringify(auth));

        message.reply('you have been authenticated!');
      } catch (err) {
        message.reply('invalid token!');
      }

      collector.stop();
    });
  },
};

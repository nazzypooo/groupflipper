const Discord = require('discord.js');
const noblox = require('noblox.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const config = require('./config.json');
const auth = require('./auth.json');

const { Client, Intents } = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const prefix = '!'; // Change this to your desired command prefix

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  if (message.author.bot) return; // Ignore messages from bots
  if (!message.content.startsWith(prefix)) return; // Ignore messages that don't start with the prefix

  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'auth') {
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
        message.reply(`please enter the ID of the Roblox group you want to flip.`);
        const groupIdFilter = m => m.author.id === message.author.id;
        const groupIdCollector = message.channel.createMessageCollector(groupIdFilter, { time: 30000 });
        groupIdCollector.on('collect', async groupMsg => {
          const groupId = groupMsg.content.trim();
          const groupMembership = await noblox.getRankInGroup(groupId, user.userId);
          if (groupMembership === 0) {
            message.reply('you are not a member of the required group.');
            collector.stop();
            return;
          }

          // Hash and store the token and group ID
          const hashedToken = await bcrypt.hash(token, 10);
          auth[message.author.id] = {
            token: hashedToken,
            groupId: groupId,
          };
          fs.writeFileSync('./auth.json', JSON.stringify(auth));

          message.reply('you have been authenticated!');
          groupIdCollector.stop();
        });
      } catch (err) {
        message.reply('invalid token!');
        collector.stop();
      }

      collector.stop();
    });
  }

  if (command === 'flip') {
    // Check if the user is authenticated
    if (!auth[message.author.id]) {
      message.reply('you are not authenticated. Please use the !auth command to authenticate yourself.');
      return;
    }

    // Check if the group ID is valid
    const groupId = auth[message.author.id].groupId;
    const groupInfo = await noblox.getGroup(groupId);
    if (!groupInfo) {
      message.reply(`the group ID you entered (${groupId}) is invalid.`);
      return;
    }

    // Implement the heads or tails game logic here
  }
});

client.login(config.token);

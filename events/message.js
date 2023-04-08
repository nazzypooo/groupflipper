const prefix = '!'; // Change this to your desired command prefix

module.exports = {
  name: 'message',
  execute(message, client) {
    if (message.author.bot) return; // Ignore messages from bots
    if (!message.content.startsWith(prefix)) return; // Ignore messages that don't start with the prefix

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  },
};

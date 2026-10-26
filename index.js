
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
  Events
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

if (!token || !welcomeChannelId) {
  console.error(
    "Missing DISCORD_TOKEN or WELCOME_CHANNEL_ID in environment variables."
  );
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

function getEmbedColor() {
  const color = process.env.EMBED_COLOR || "#E879C5";

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return 0xE879C5;
  }

  return parseInt(color.slice(1), 16);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`PPG Welcome Bot online as ${readyClient.user.tag}`);
  console.log(`Watching welcome channel: ${welcomeChannelId}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels.fetch(
      welcomeChannelId
    );

    if (!channel || !channel.isTextBased() ||
        !channel.isSendable()) {
      console.error("Welcome channel is missing or cannot receive messages.");
      return;
    }

    const serverName =
      process.env.SERVER_NAME || member.guild.name;

    const welcomeMessage =
      process.env.WELCOME_MESSAGE ||
      "We're so happy to have you here! Please check out the server rules and enjoy your stay.";

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setColor(getEmbedColor())
      .setAuthor({
        name: `Welcome to ${serverName}!`,
        iconURL: member.guild.iconURL() || undefined
      })
.setTitle(`Welcome, ${member.user.username}!`)
.setDescription(
  `🦋 Welcome ${member}! 💖\n\n` +
  `Welcome to **${serverName}**! 🥂\n\n` +
  `Your home for private parties, sticker trades & good vibes! 💖\n\n` +
  `📜 <#1496243868717420664> ・Server Rules\n` +
  `❤️ <#1496243796793491617> ・Meet The Team\n` +
  `🎉 <#1496244191880151151> ・Party Guide\n` +
  `🥂 <#1496329052728983743> ・Party Schedule\n\n` +
  `🤖 **NEW PPG SIGNUP BOT!** 💖\n` +
  `Select your event in the signup channel, complete the form with your IGN & game tag, and follow the bot's instructions! 🥳\n\n` +
  `💕 Good vibes only — we're happy you're here! 🦋`
)
.setThumbnail(
  member.user.displayAvatarURL({ size: 256 })
)

      .addFields({
        name: "👥 Member Count",
        value: `You're member **#${memberCount}**!`,
        inline: true
      })
      .setFooter({
        text: `${serverName} • We're glad you're here!`
      })
      .setTimestamp();

    const banner = new AttachmentBuilder(
  require("node:path").join(__dirname, "ppg-welcome.png"),
  { name: "ppg-welcome.png" }
);

embed.setImage("attachment://ppg-welcome.png");

    await channel.send({
  embeds: [embed],
  files: [banner],
  allowedMentions: {
    users: [member.id]
  }
});


try {
  await member.send({
    embeds: [
      new EmbedBuilder()
        .setColor(getEmbedColor())
        .setTitle("🦋 Welcome to Sunday City: PPG Parties! 🥂")
        .setDescription(
          `Hey ${member.user.username}! 💖\n\n` +
          `We're so happy you've joined our family! 🥰\n\n` +
          `📜 **Server Rules**\n` +
          `Please read the rules in the server before joining parties.\n\n` +
          `❤️ **Meet The Team**\n` +
          `Get to know our lovely staff!\n\n` +
          `🎉 **Party Guide**\n` +
          `Learn how our parties work.\n\n` +
          `🥂 **Party Schedule**\n` +
          `Keep an eye out for upcoming events!\n\n` +
          `🤖 **NEW PPG SIGNUP BOT!**\n` +
          `Head to the signup channel, select your event, and enter your IGN and game tag. Follow the bot's instructions to sign up! 🥳\n\n` +
          `💕 Have fun, make friends and enjoy the parties! Welcome to PPG! 🦋`
        )
        .setFooter({ text: "Sunday City • PPG Parties" })
        .setTimestamp()
    ]
  });
} catch (error) {
  console.log(`Could not DM ${member.user.tag}. Their DMs may be closed.`);
}
    
    console.log(
      `Welcomed ${member.user.tag} in ${member.guild.name}. Members: ${memberCount}`
    );
  } catch (error) {
    console.error("Could not send welcome message:", error);
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.login(token).catch((error) => {
  console.error("Failed to log in to Discord:", error);
  process.exit(1);
});

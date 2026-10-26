
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const path = require("node:path");
const fs = require("node:fs");

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

const adminChannelId = "1496289610668707981";

// =====================================
// PPG ROAST BOT SETTINGS
// =====================================

const roastCooldowns = new Map();
const optedOutUsers = new Set();
const ROAST_COOLDOWN_MS = 15000;

const ROASTS = {
  friendly: [
    "You're the human version of a loading screen.",
    "You bring people together… mostly to ask what on earth you're doing.",
    "Your brain has 37 tabs open and the music is coming from none of them.",
    "You're about as organised as a sock drawer during an earthquake.",
    "You're proof that confidence and accuracy are distant cousins.",
    "You have the energy of a printer that says it's out of paper when it's full.",
    "You're not late; you're just committed to making an entrance nobody requested.",
    "Your superpower is turning a two-minute task into a seasonal storyline.",
    "You could lose a staring contest with a screensaver.",
    "You're like a software update: nobody asked, but here you are.",
    "You have two brain cells and they're both on their lunch break.",
    "You're the plot twist in a story that needed an editor.",
    "Your attention span just left to get milk.",
    "You're the reason instructions come with pictures.",
    "You have the coordination of a shopping trolley with one wonky wheel.",
    "You could make a simple yes-or-no question need a committee meeting.",
    "Your plans have the structural integrity of wet tissue.",
    "You're not a mess; you're a limited-edition disaster.",
    "You make chaos look like a full-time profession.",
    "Your brain is buffering. Please do not turn off the user.",
    "You're the human equivalent of pressing the wrong elevator button.",
    "You're a walking reminder to save your progress.",
    "Your life runs on vibes and suspiciously little planning.",
    "You're about as subtle as a marching band in a library.",
    "You're the reason the group chat needs a mute button.",
    "You look like you apologise to automatic doors.",
    "You seem like the type to clap when the microwave finishes.",
    "You'd lose an argument with a self-checkout machine.",
    "You have the energy of a haunted air fryer.",
    "You could make a sandwich and somehow disappoint the bread.",
    "You look like you queue for a queue.",
    "Your spirit animal is a confused traffic cone.",
    "You have the elegance of a folding chair falling downstairs.",
    "You'd bring a ladder to a limbo contest and still lose.",
    "You could make a GPS say, 'Honestly, figure it out yourself.'",
    "You have the energy of a pigeon that just discovered taxes.",
    "You have the vibe of a fridge light that flickers.",
    "You could make a goldfish feel like the responsible one.",
    "You have the confidence of a wet sock in a board meeting.",
    "You'd somehow get locked out of a revolving door."
  ],

  savage: [
    "If being confidently wrong were a career, you'd be CEO.",
    "You have the confidence of a genius and the results of a dropped sandwich.",
    "You're not everyone's cup of tea. You're the mystery liquid at the bottom of the kettle.",
    "Your common sense is still on pre-order.",
    "You could trip over a cordless phone.",
    "You're a participation trophy with a Wi-Fi connection.",
    "You have main-character energy in a tutorial nobody finished.",
    "Your best feature is the mute button.",
    "You make bad decisions look like a loyalty programme.",
    "You're the reason group projects have trust issues.",
    "You have the strategic instincts of a moth in a candle shop.",
    "Your logic took a wrong turn and never came back.",
    "You're proof that a loud opinion isn't the same thing as a good one.",
    "If excuses paid rent, you'd own the whole server.",
    "You're a walking terms-and-conditions page: long, confusing, and nobody reads you.",
    "Your comeback arrived by carrier pigeon and got lost.",
    "You could turn a winning situation into a tutorial on failure.",
    "Your brain has the processing power of a potato with stage fright.",
    "You bring a lot to the table. Mostly confusion.",
    "You have the decision-making skills of a coin that lands on its edge.",
    "You're not playing hard to get; people are playing hard to find.",
    "Your charisma has entered airplane mode.",
    "You have the rare talent of making silence feel productive.",
    "Your opinions have a free trial that should have expired.",
    "You're a red flag with a typing indicator.",
    "You have the confidence of a genius and the evidence of a broken calculator.",
    "You could make a winning lottery ticket look like a bad investment.",
    "Your common sense has been discontinued.",
    "You're a walking tutorial on what not to do.",
    "Your comeback needs a comeback.",
    "You could lose an argument with a terms-of-service agreement.",
    "You have the energy of a meeting that could have been an email.",
    "You're the human version of a typo in a password.",
    "Your ideas need adult supervision.",
    "You're a plot hole with a Discord account.",
    "You could turn a shortcut into a three-hour side quest.",
    "You're not the sharpest tool in the shed; you're the instruction manual.",
    "You have a black belt in missing the point.",
    "Your plans are held together by hope and incorrect information.",
    "If logic were a subscription, yours would have expired."
  ],

  dark: [
    "Your guardian angel has put you on do-not-disturb.",
    "Your life has more plot holes than a horror film written at 3 AM.",
    "Even the Grim Reaper would check his calendar before dealing with your nonsense.",
    "Your luck is so bad, you'd lose hide-and-seek against a mirror.",
    "Your future is so mysterious, even the fortune teller asked for a refund.",
    "Your life coach would need a life coach after one session with you.",
    "If karma had a customer service desk, your name would be on speed dial.",
    "Your personal horror story is just your browser history and your decisions.",
    "The light at the end of your tunnel is probably a train of bad ideas.",
    "Your luck could make a four-leaf clover file a complaint.",
    "Your autobiography would be filed under 'unexplained incidents'.",
    "Your plans are so doomed, the soundtrack has already switched to funeral music.",
    "Even your shadow needs a break from following your decisions.",
    "Your inner peace has moved out and left no forwarding address.",
    "Your life is a cautionary tale with excellent Wi-Fi.",
    "Your luck is the reason fortune cookies started using disclaimers.",
    "If disasters had loyalty cards, you'd have earned a free one by now.",
    "Your decision tree is just a haunted forest with no exits.",
    "The universe saw your plans and whispered, 'Let's make this interesting.'",
    "Your luck is so cursed, a black cat crosses the street to avoid you.",
    "Your personal plot twist needs a content warning for poor judgement.",
    "Your future called. It said, 'Please stop making this harder.'",
    "Even your backup plan needs a backup plan and emotional support.",
    "Your life is like a horror movie: everyone watching is yelling, 'Don't do that!'",
    "If bad omens had a group chat, they'd be discussing you.",
    "Your guardian angel updated their CV after meeting you.",
    "Your luck is so bad, even the loading screen says 'good luck with that'.",
    "Your life has the atmosphere of a haunted house with unpaid bills.",
    "If consequences were ghosts, your past would be a full paranormal investigation.",
    "Your future is looking like a mystery novel with missing pages.",
    "Your decisions have more warning signs than a cursed forest.",
    "Even your bad ideas have started asking for legal representation.",
    "Your luck could make a horror film director say, 'That's a bit much.'",
    "The universe keeps sending you signs. You keep treating them like spam.",
    "Your plans have been declared missing under suspicious circumstances.",
    "Your personal plot armour is made from wet paper.",
    "Your luck is so cursed, your horoscope comes with an apology.",
    "Your life story needs a disclaimer and a very patient narrator.",
    "Your backup plan has submitted a formal resignation.",
    "Your luck has a villain origin story, and you're the villain."
  ],

  gaming: [
    "Your reaction time has a loading spinner.",
    "Even the tutorial NPC is tired of explaining things to you.",
    "You'd get lost in a loading screen.",
    "Your gameplay is a public service announcement for practice.",
    "You play like your controller is connected through a potato.",
    "Your aim is sponsored by the local insurance company.",
    "You could miss a stationary target with a guided tutorial.",
    "Your strategy is just pressing buttons and hoping the credits roll.",
    "You're the reason the team has a group therapy channel.",
    "Your kill/death ratio looks like a customer support ticket.",
    "The only thing you're carrying is the team's emotional baggage.",
    "You have the map awareness of a goldfish in a snow globe.",
    "Your controller deserves workers' compensation.",
    "You're not lagging; your decisions are just arriving late.",
    "You make bots look like esports champions.",
    "Your rank is a cry for help written in pixels.",
    "You could lose a tutorial mission with the answers on screen.",
    "Your game sense is currently unavailable in your region.",
    "Your inventory is full of excuses and empty slots.",
    "You don't need a nerf; you need a user manual.",
    "Your strategy guide is just a list of things not to do.",
    "You respawn more often than you make good decisions.",
    "Your crosshair has filed for independence.",
    "Even the NPCs are asking you to hurry up.",
    "You play like the Wi-Fi is powered by a hamster.",
    "Your gameplay needs a parental advisory.",
    "Your strategy is to panic and hope the enemy disconnects.",
    "You're the reason the lobby has a report button.",
    "Your aim has more holidays than you do.",
    "You could lose a tutorial with a personal coach.",
    "Your game sense is on permanent maintenance.",
    "You make the practice dummy look intimidating.",
    "Your controller is fine; it's the person holding it.",
    "Your gameplay is a documentary called 'What Could Go Wrong?'",
    "You don't clutch rounds; you clutch excuses.",
    "Your respawn timer is the most consistent thing about you.",
    "You play like every button is a surprise.",
    "Your tactical plan was written on a napkin in a hurricane.",
    "Even the tutorial wants to skip your turn.",
    "You're the final boss of making easy things difficult."
  ],

  absurd: [
    "You have the aura of a damp receipt.",
    "Your vibe is an unseasoned boiled potato wearing sunglasses.",
    "You seem like you get scammed by a fortune cookie.",
    "You are the human version of a spoon with a hole in it.",
    "Your personality has the texture of an unskippable advert.",
    "You have the confidence of a wet sock in a board meeting.",
    "You're the reason the manual says 'do not eat'.",
    "You look like you say 'you too' when the waiter says enjoy your meal.",
    "You have the energy of a pigeon that just discovered taxes.",
    "You could make a sandwich and somehow disappoint the bread.",
    "You seem like you put your phone on charge at 1% and walk away.",
    "You have the vibe of a fridge light that flickers.",
    "You'd bring a ladder to a limbo contest and still lose.",
    "Your aura smells like a forgotten group project.",
    "You could make a GPS say, 'Honestly, figure it out yourself.'",
    "You're like a mystery flavour crisp, except the mystery is why you're here.",
    "You have the elegance of a folding chair falling downstairs.",
    "You could make a goldfish feel like the responsible one.",
    "You look like you queue for a queue.",
    "You have the energy of a haunted air fryer.",
    "You'd lose an argument with a self-checkout machine.",
    "Your spirit animal is a confused traffic cone.",
    "You have the vibe of a haunted printer.",
    "You look like you apologise to automatic doors.",
    "You could get lost in a revolving door.",
    "Your personality is a wet floor sign in a desert.",
    "You have the energy of a microwave with stage fright.",
    "You look like a software update wearing shoes.",
    "You could confuse a GPS by standing still.",
    "You're the human version of a password reset email.",
    "You seem like you'd bring a spoon to a barbecue.",
    "Your vibe is a potato that forgot its own recipe.",
    "You have the energy of a confused garden gnome.",
    "You could make a traffic cone look charismatic.",
    "Your brain is a group project where nobody did the work.",
    "You look like you need a tutorial to open a banana.",
    "You could get outsmarted by a revolving door.",
    "You're the reason shampoo has instructions.",
    "You have the charisma of a waiting-room magazine.",
    "You'd somehow lose a game of rock-paper-scissors to a wall."
  ], 
    adult: [
    "You're proof that pulling out isn't just for smokers.",
    "Your sex life has more cancellations than a budget airline.",
    "Your idea of foreplay is asking for the Wi-Fi password.",
    "You've got the sexual charisma of a damp flannel.",
    "Your bedroom performance deserves a refund and an apology.",
    "You're so bad at flirting that even spam emails have better conversion rates.",
    "Your love life is like a fire alarm: loud, stressful, and nobody wants it going off.",
    "You couldn't get lucky if Cupid delivered the arrow personally.",
    "Your game in the bedroom is so weak the tutorial uninstalled itself.",
    "Your flirting makes people consider a vow of silence.",
    "You're the type to say 'I'm almost there' before you've even started.",
    "Your romantic prospects have the same status as a deleted account.",
    "Your body count isn't the issue. It's the lack of witnesses to your personality.",
    "You're a walking advertisement for staying single.",
    "Even your imaginary partner needs a break.",
    "Your idea of a threesome is you, your phone, and a takeaway.",
    "You've got more red flags than a brothel during a fire drill.",
    "Your love life is so dead even the funeral director has moved on.",
    "You're the reason people read the terms and conditions before dating.",
    "Your flirting technique belongs in a museum labelled 'What Not To Do'.",
    "You bring absolutely nothing to the bedroom except disappointment.",
    "Your ex didn't leave you. They escaped a long-term subscription.",
    "You're about as seductive as a parking fine.",
    "Your romantic aura screams 'terms and conditions apply'.",
    "If bad decisions were foreplay, you'd be irresistible."
  ]
};

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRoast(mode) {
  if (mode === "random") {
    return pickRandom(Object.values(ROASTS).flat());
  }

  return pickRandom(ROASTS[mode] || ROASTS.friendly);
}

function isOnCooldown(userId) {
  const lastUsed = roastCooldowns.get(userId) || 0;
  const remaining = ROAST_COOLDOWN_MS - (Date.now() - lastUsed);

  if (remaining > 0) {
    return Math.ceil(remaining / 1000);
  }

  roastCooldowns.set(userId, Date.now());
  return 0;
}

// =====================================
// SLASH COMMANDS
// =====================================

const roastCommands = [
  new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Roast yourself or a willing friend.")
    .addStringOption(option =>
      option.setName("mode")
        .setDescription("Choose your roast style.")
        .setRequired(false)
        .addChoices(
          { name: "Friendly 😂", value: "friendly" },
          { name: "Savage 🔥", value: "savage" },
          { name: "Dark humour 💀", value: "dark" },
          { name: "Gaming 🎮", value: "gaming" },
          { name: "Absurd 🤡", value: "absurd" },
          { name: "Random 🎲", value: "random" }
        )
    )
    .addUserOption(option =>
      option.setName("member")
        .setDescription("Choose a member who is okay with friendly banter.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("roastme")
    .setDescription("Ask the bot to roast you."),

  new SlashCommandBuilder()
    .setName("darkroast")
    .setDescription("Get a dark-humour roast."),

  new SlashCommandBuilder()
    .setName("roastoptout")
    .setDescription("Toggle whether others can target you with /roast."),

  new SlashCommandBuilder()
    .setName("roasthelp")
    .setDescription("Show the PPG Roast Bot commands and modes.")
].map(command => command.toJSON());

async function registerRoastCommands(applicationId) {
  const rest = new REST({ version: "10" }).setToken(token);
  const guildId = process.env.GUILD_ID;

  if (guildId) {
    await rest.put(
      Routes.applicationGuildCommands(applicationId, guildId),
      { body: roastCommands }
    );

    console.log(`Registered roast commands for guild ${guildId}.`);
  } else {
    await rest.put(
      Routes.applicationCommands(applicationId),
      { body: roastCommands }
    );

    console.log(
      "Registered global roast commands. They may take a while to appear."
    );
  }
}

// =====================================
// BOT READY + COMMAND HANDLING
// =====================================

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`PPG Welcome Bot online as ${readyClient.user.tag}`);
  console.log(`Watching welcome channel: ${welcomeChannelId}`);

  try {
    await registerRoastCommands(readyClient.application.id);
  } catch (error) {
    console.error("Could not register roast slash commands:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user, guild } = interaction;

  if (!guild) {
    return interaction.reply({
      content: "The PPG Roast Bot can only be used in a server.",
      ephemeral: true
    });
  }

  if (
    ![
      "roast",
      "roastme",
      "darkroast",
      "roastoptout",
      "roasthelp"
    ].includes(commandName)
  ) {
    return;
  }

  if (commandName === "roasthelp") {
    return interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(getEmbedColor())
          .setTitle("🔥 PPG Roast Bot Commands")
          .setDescription(
            "`/roast` — roast yourself or a friend; choose a style.\n" +
            "`/roastme` — volunteer to be roasted.\n" +
            "`/darkroast` — get a dark-humour roast.\n" +
            "`/roastoptout` — toggle whether others can target you.\n\n" +
            "**Modes:** Friendly, Savage, Dark Humour, Gaming, Absurd, Random.\n" +
            "**Cooldown:** 15 seconds per user.\n" +
            "Keep it playful. Don't use roasts to target someone who isn't enjoying the joke."
          )
      ]
    });
  }

  if (commandName === "roastoptout") {
    if (optedOutUsers.has(user.id)) {
      optedOutUsers.delete(user.id);

      return interaction.reply({
        content: "✅ You're opted back in. Friends can target you with `/roast` again.",
        ephemeral: true
      });
    }

    optedOutUsers.add(user.id);

    return interaction.reply({
      content: "🛑 You're opted out. Other members can't target you with `/roast`. You can still use `/roastme` yourself.",
      ephemeral: true
    });
  }

  const cooldown = isOnCooldown(user.id);

  if (cooldown > 0) {
    return interaction.reply({
      content: `Easy there 😂 Try roasting again in **${cooldown} seconds**.`,
      ephemeral: true
    });
  }

  let target = user;
  let mode = "random";

  if (commandName === "roast") {
    mode = interaction.options.getString("mode") || "random";
    target = interaction.options.getUser("member") || user;
  } else if (commandName === "darkroast") {
    mode = "dark";
  }

  if (target.bot) {
    return interaction.reply({
      content: "😂 Let the humans take the roasting. Pick a real member!",
      ephemeral: true
    });
  }

  if (target.id !== user.id && optedOutUsers.has(target.id)) {
    return interaction.reply({
      content: "🛑 That member has opted out of being targeted by roasts. Pick someone else or roast yourself.",
      ephemeral: true
    });
  }

  const roast = getRoast(mode);

  const label =
    mode === "dark" ? "💀 DARK HUMOUR ROAST" :
    mode === "savage" ? "🔥 SAVAGE ROAST" :
    mode === "gaming" ? "🎮 GAMING ROAST" :
    mode === "absurd" ? "🤡 ABSURD ROAST" :
    mode === "friendly" ? "😂 FRIENDLY ROAST" :
    "🎲 RANDOM ROAST";

  const embed = new EmbedBuilder()
    .setColor(getEmbedColor())
    .setTitle(label)
    .setDescription(`${target} ${roast}`)
    .setFooter({
      text: `Requested by ${user.username} • Friendly banter only`
    })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed],
    allowedMentions: { users: [target.id] }
  });
});

// =====================================
// MEMBER LEAVE NOTIFICATION
// =====================================

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const channel = await member.guild.channels.fetch(adminChannelId);

    if (!channel || !channel.isTextBased() || !channel.isSendable()) {
      console.error("Admin chat channel not found or not accessible.");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle("📤 Member Left PPG")
      .setDescription(
        `**Username:** ${member.user.tag}\n` +
        `**User ID:** \`${member.id}\`\n` +
        `**Members remaining:** ${member.guild.memberCount}`
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    console.log(`Leave notification sent for ${member.user.tag}`);
  } catch (error) {
    console.error("Failed to send leave notification:", error);
  }
});

// =====================================
// MEMBER WELCOME MESSAGE + PRIVATE DM
// =====================================

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels.fetch(welcomeChannelId);

    if (!channel || !channel.isTextBased() || !channel.isSendable()) {
      console.error("Welcome channel is missing or cannot receive messages.");
      return;
    }

    const serverName = process.env.SERVER_NAME || member.guild.name;
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
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields({
        name: "👥 Member Count",
        value: `You're member **#${memberCount}**!`,
        inline: true
      })
      .setFooter({
        text: `${serverName} • We're glad you're here!`
      })
      .setTimestamp();

    const bannerPath = path.join(__dirname, "ppg-welcome.png");

    if (fs.existsSync(bannerPath)) {
      const banner = new AttachmentBuilder(bannerPath, {
        name: "ppg-welcome.png"
      });

      embed.setImage("attachment://ppg-welcome.png");

      await channel.send({
        embeds: [embed],
        files: [banner],
        allowedMentions: { users: [member.id] }
      });
    } else {
      console.warn(
        "ppg-welcome.png not found; sending welcome embed without banner."
      );

      await channel.send({
        embeds: [embed],
        allowedMentions: { users: [member.id] }
      });
    }

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
            .setFooter({
              text: "Sunday City • PPG Parties"
            })
            .setTimestamp()
        ]
      });
    } catch (error) {
      console.log(
        `Could not DM ${member.user.tag}. Their DMs may be closed.`
      );
    }

    console.log(
      `Welcomed ${member.user.tag} in ${member.guild.name}. Members: ${memberCount}`
    );
  } catch (error) {
    console.error("Could not send welcome message:", error);
  }
});

// =====================================
// GENERAL ERROR HANDLING
// =====================================

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

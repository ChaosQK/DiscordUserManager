const { Client, Intents, MessageEmbed } = require('discord.js');
const moment = require('moment');
const intents = new Intents([
  Intents.NON_PRIVILEGED,
  "GUILD_MEMBERS",
]);
const client = new Client({ ws: { intents }});

var membersDictionary = {};

client.once('ready', () => {
  console.log('Ready!');
  client.user.setPresence({ activity: { name: 'with something', type: "PLAYING" }, status: 'online' });
  initAllMembers();

  setInterval(() => {
    for(var memID in membersDictionary)
    {
      var dayDiff = getDaysDifference(new Date(Date.now())).getTime() - membersDictionary[memID].getTime();
      var member = client.guilds.cache.get("GUILDID").members.cache.get(memID);
      
      if(dayDiff > 7)
      {
        member.roles.add("ROLEID");
        member.roles.remove("ROLEID");
      }
    }
  }, 1000*60*60);
});

async function initAllMembers()
{
  var memoryDictionary;

  const allmembers = client.guilds.cache.get("GUILDID").members.fetch().then(function(member) {
    var memDic = {};
    member.each(mem => {
      if(mem.user.username !== "BOTNAME")
      {
        memDic[mem.user.id] = new Date(Date.now());
      }
    });
    return memDic;
  });

  await allmembers.then(data => memoryDictionary = data);
  setMembersDict(memoryDictionary);
}

function setMembersDict(dict)
{
  membersDictionary = dict;
}

client.on('message', message => {
  if(message.content.startsWith("!check"))
  {
    message.delete()
    var args = message.content.split(" ");
    if (message.member.roles.cache.has("ADMINID") || message.member.roles.cache.has("MODID"))
    {
      if(args.length === 2)
      {
        const user = getUserFromMention(args[1]);
        if(user !== undefined)
        {
          const diff = getTimeDifference((new Date(Date.now())).getTime() - membersDictionary[user.id].getTime());
          const infoMess = new MessageEmbed().setColor("#00B6FF").setTitle("INFORMATION").setDescription(args[1] + " has been inactive for : " + diff);
          message.channel.send(infoMess);
        }
        else
        {
          const errorMess = new MessageEmbed().setColor("#FF0000").setTitle("ERROR").setDescription("User " + args[1] + " is not valid !");
          message.channel.send(errorMess);
        }
      }
      else
      {
        const errorMess = new MessageEmbed().setColor("#FF0000").setTitle("ERROR").setDescription("Synthax Error !");
        message.channel.send(errorMess);
      }
    }
    else
    {
      const errorMess = new MessageEmbed().setColor("#FF0000").setTitle("ERROR").setDescription("You do not have permission to perform this command !");
      message.channel.send(errorMess);
    }
  }
  

  var member = message.member.id;
  membersDictionary[member] = new Date(Date.now());
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel
  membersDictionary[newMember.id] = new Date(Date.now());
})

function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

function getTimeDifference(milli)
{ 
  const seconds = parseInt(milli / (1000))
  const minutes = parseInt(milli / (1000*60))
  const hours = parseInt(milli / (1000*60*60))
  const day = parseInt(milli / (1000*60*60*24))

  return (day === 0 ? "" : day + " day(s) ") +
         (hours === 0 ? "" : (hours % 24) + " hour(s) ") +
         (minutes === 0 ? "" : (minutes % 60) + " minute(s) ") +
         (seconds === 0 ? "" : (seconds % 60) + " second(s)");
         
}

function getDaysDifference(milli)
{
  return parseInt(milli / (1000*60*60*24))
}

client.on('guildMemberAdd', member => {
  membersDictionary[member.user.id] = new Date(Date.now());
});

client.on('guildMemberRemove', member => {
  delete membersDictionary[member.user.id];
});

/*function printMembersLogs()
{
  for(var key in membersDictionary)
  {
    console.log(membersDictionary[key].user.username);
  }
}*/

client.login('*************************************************************');

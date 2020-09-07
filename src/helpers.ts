import { GuildMemberManager, GuildMember } from "discord.js";

// Players announcing they have used a star.
const playerSearch = (members:GuildMemberManager, pname:string):GuildMember => {
  let memberInChannel:GuildMember | null = null;

  members.cache.forEach((member) => {
    if (member.nickname) {
      if (pname.toLowerCase() === member.nickname.toLowerCase()) {
        memberInChannel = member;
      }
    } else if (member.user.username) {
      if (pname.toLowerCase() === member.user.username.toLowerCase()) {
        memberInChannel = member;
      }
    }
  });

  if (memberInChannel === null) {
    throw new Error(`No member found with name: ${pname}`);
  }

  return memberInChannel;
};

export default {
  playerSearch
};

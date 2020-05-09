// Players announcing they have used a star.
const playerSearch = (members, pname) => {
  let memberInChannel = null;
  members.cache.forEach((member) => {
    if (member.user.nickname) {
      if (pname.toLowerCase() === member.user.nickname.toLowerCase()) {
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

exports.playerSearch = playerSearch;

const channels = {};
const tells = {};

function join(channel, password, user) {
  if (channels[channel] === undefined) {
    return `channel ${channel} does not exist`;
  }

  if (channels[channel].users.includes(user)) {
    return 'you cannot join this channel again';
  }

  password = password || '';

  if (password !== channels[channel].password) {
    return 'incorrect password';
  }

  channels[channel].users.push(user);

  send(channel, 'user joined channel', user, true);

  return true;
}

function create(channel, password, user) {
  if (channels[channel] !== undefined) {
    return `channel ${channel} is taken`;
  }

  password = password || '';

  channels[channel] = {
    name: channel, password, users: [], msgs: [],
  };

  join(channel, password, user);

  return true;
}

function send(channel, msg, user, special = false) {
  if (channels[channel] === undefined) {
    return `channel ${channel} does not exist`;
  }

  if (!channels[channel].users.includes(user)) {
    return `you aren't in ${channel}. join channel with chats.join`;
  }

  channels[channel].msgs.push({ msg, user, special });

  showMessage(channel, user, msg, special);
  // channels[channel].dispatchEvent(new CustomEvent('message', {msg: msg, user: user, channel: channel, special: special}));

  return true;
}

function leave(channel, user) {
  if (channels[channel] === undefined) {
    return `channel ${channel} does not exist`;
  }

  if (!channels[channel].users.includes(user)) {
    return `you aren't in ${channel}. join channel with chats.join`;
  }

  send(channel, 'user left channel', user, true);

  channels[channel].users.splice(channels[channel].users.indexOf(user), 1);

  return true;
}

function getTimestamp() {
  const date = new Date();

  let hour = date.getHours();
  hour = (hour < 10 ? '0' : '') + hour;

  let min = date.getMinutes();
  min = (min < 10 ? '0' : '') + min;

  return hour + min;
}

function showMessage(channel, user, msg, special, slowed = false) {
  if (!slowed) {
    setTimeout(() => { showMessage(channel, user, msg, special, true); }, 100);

    return;
  }

  if (channels[channel] && !channels[channel].users.includes(global.user)) {
    return;
  }

  const _timestamp = `\`C${getTimestamp()}\``;

  const _channel = special ? `\`N${channel}\`` : `\`V${channel}\``;

  if (!global.users.includes(user)) {
    global.users.push(user);
  }

  const _user = `\`${global.logging.getUserColor(user)}${user}\``;
  const _msg = `\`b:::\`${msg}\`b:::\``;

  global.logging.log(`\r${_timestamp} ${_channel} ${_user} ${_msg}`);

  process.stdout.write('\n:');
}

function users(channel, user) {
  if (channels[channel] === undefined) {
    if (global.mode !== 'hackmud+') {
      return `Can't list users for ${channel} because you haven't joined it.`;
    }
    return `channel ${channel} does not exist`;
  }

  if (!channels[channel].users.includes(user)) {
    return `Can't list users for ${channel} because you haven't joined it.`;
  }

  return channels[channel].users;
}

function channelsScript(user) {
  return Object.values(channels).filter((c) => c.users.includes(user)).map((c) => c.name);
}

function tell(to, msg, user) {
  const users = [user, to].sort();

  if (!tells[`${users[0]}-${users[1]}`]) {
    tells[`${users[0]}-${users[1]}`] = { msgs: [], users };
  }

  tells[`${users[0]}-${users[1]}`].msgs.push(msg);

  if (user === global.user) {
    showMessage('to', to, msg, true);
  }

  if (to === global.user) {
    showMessage('from', user, msg, true);
  }

  return true;
}

module.exports = {
  join,
  create,
  send,
  tell,
  leave,
  users,
  channels: channelsScript,
};


var emitter = null;

module.exports =
{
  list: {},

  start: function(e)
  {
    emitter = e;
    setTimeout(updateRealTime, msToNextSecond());
    return this;
  },

  startCount: function(key)
  {
    this.list[key] = 0;
    setTimeout(count.bind(null, key), msToNextSecond());
  },

  stopCount: function(key)
  {
    delete this.list[key];
  },

  startCountdown: function(time, key)
  {
    this.list[key] = time;
    setTimeout(countdown.bind(null, key), 6000);
  }
}

function msToNextHour()
{
  var d = new Date();
  d.setHours(d.getHours() + 1);
  d.setMinutes(0);
  d.setSeconds(0);

  return d.getTime() - Date.now();
}

function msToNextMinute()
{
  var d = new Date();
  d.setMinutes(d.getMinutes() + 1);
  d.setSeconds(0);
  return d.getTime() - Date.now();
}

function msToNextSecond()
{
  var d = new Date();
  d.setSeconds(d.getSeconds() + 1);
  return d.getTime() - Date.now();
}

function countdown(key)
{
  module.exports.list[key]--;

  if (module.exports.list[key] <= 0)
  {
    //finished
    delete module.exports.list[key];
    emitter.emit(key);
  }

  else setTimeout(countdown.bind(null, key), 6000);
}

function count(key)
{
  if (module.exports.list[key] == null)
  {
    return;
  }

  module.exports.list[key]++;
  setTimeout(count.bind(null, key), msToNextSecond());
}

function updateRealTime()
{
  var d = new Date();
  emitter.emit("second");

  if (d.getSeconds() % 5 == 0)
  {
    emitter.emit("5 seconds");
  }

  if (d.getSeconds() % 30 == 0)
  {
    emitter.emit("30 seconds");
  }

  if (d.getSeconds() == 0)
  {
    emitter.emit("minute");
  }

  if (d.getMinutes() % 5 == 0)
  {
    emitter.emit("5 minutes");
  }

  if (d.getMinutes() == 0)
  {
    emitter.emit("hour");
  }

  setTimeout(updateRealTime, msToNextSecond());
}

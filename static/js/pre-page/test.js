const s = new SubSocket('test', socket);
s.init();

const l = s.on('update');

l.on(console.log);
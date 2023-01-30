
const log = (obj) => {
  const now = new Date();
  console.log0(`[${now.toLocaleDateString()} ${now.toLocaleTimeString()}] ${obj}`);
}

if (!console.log0) {
  console.log0 = console.log;
  console.log = log;
}

export {
  log
}
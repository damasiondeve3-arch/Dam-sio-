const http = require('http');
http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/plain'});
  res.end('DAMASIO BOT ONLINE');
}).listen(process.env.PORT || 10000, ()=>console.log('Servidor online'));

const {default:makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys');
const P = require('pino');

async function start(){
  const {state, saveCreds} = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    logger: P({level:'silent'}),
    auth: state,
    printQRInTerminal: false
  });

  if(!sock.authState.creds.registered){
    await new Promise(r=>setTimeout(r,3000));
    try{
      let code = await sock.requestPairingCode('258866896924');
      console.log('\n==========================');
      console.log(`CODIGO PARA 258866896925: ${code}`);
      console.log('==========================\n');
    }catch(e){ console.log('Erro pairing:', e.message) }
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    if(u.connection === 'open') console.log('CONECTADO! BOT ONLINE!');
  });
  sock.ev.on('messages.upsert', async({messages})=>{
    const m = messages[0];
    if(!m.message) return;
    const texto = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if(texto.toLowerCase() === '.ping'){
      await sock.sendMessage(m.key.remoteJid, {text:'Pong! Bot do Damasio online 🚀'});
    }
  });
}
start();

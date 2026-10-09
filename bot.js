const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('Dam-sio Bot online!');}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Web rodando'));

const {default:makeWASocket,useMultiFileAuthState}=require('@whiskeysockets/baileys');
const P=require('pino');
async function start(){
 const {state,saveCreds}=await useMultiFileAuthState('auth');
 const sock=makeWASocket({logger:P({level:'silent'}),auth:state,printQRInTerminal:false,browser:['Dam-sio Bot','Chrome','1.0']});
 if(!sock.authState.creds.registered){
  await new Promise(r=>setTimeout(r,3000));
  try{
   let code=await sock.requestPairingCode("258866894924");
   console.log(`\n======================================`);
   console.log(`CODIGO: ${code}`);
   console.log(`======================================\n`);
  }catch(e){console.log('Erro:',e)}
 }
 sock.ev.on('creds.update',saveCreds);
 sock.ev.on('connection.update',u=>{if(u.connection==='open')console.log('BOT CONECTADO!');if(u.connection==='close')start();});
 sock.ev.on('messages.upsert',async({messages})=>{
  const m=messages[0];if(!m.message||m.key.fromMe)return;
  const txt=(m.message.conversation||m.message.extendedTextMessage?.text||"").toLowerCase();
  const from=m.key.remoteJid;
  if(txt==='oi'||txt==='ola'){await sock.sendMessage(from,{text:'Ola! Sou o Dam-sio Bot 🤖'})}
 });
}
start();

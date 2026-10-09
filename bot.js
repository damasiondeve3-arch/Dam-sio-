const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const P = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Dam-sio Bot', 'Chrome', '1.0']
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            console.log('=== ESCANEIE O QR CODE ABAIXO NO WHATSAPP ===')
            qrcode.generate(qr, { small: true })
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Conexão fechada, reconectando...', shouldReconnect)
            if (shouldReconnect) {
                startBot()
            }
        } else if (connection === 'open') {
            console.log('✅ BOT CONECTADO COM SUCESSO!')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        if (msg.key.fromMe) return

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const from = msg.key.remoteJid

        if (texto.toLowerCase() === 'ping') {
            await sock.sendMessage(from, { text: '🏓 Pong! Bot online!' })
        }
        if (texto.toLowerCase() === 'oi' || texto.toLowerCase() === 'ola') {
            await sock.sendMessage(from, { text: 'Olá! Sou o Dam-sio Bot 🤖\nDigite *ping* para testar.' })
        }
    })
}

startBot()
console.log('Iniciando bot...')

// ╔══════════════════════════════════════╗
// ║        📋 أمر .menu الرئيسي          ║
// ║   يرسل صورة + كابتشن + زرين         ║
// ╚══════════════════════════════════════╝

// ───────────────────────────────────────
// ⚙️  إعدادات قابلة للتخصيص
// ───────────────────────────────────────
const CONFIG = {
  // 🖼️ رابط صورة القائمة — غيّره برابطك
  image: global.imgBot
    || global.img
    || 'https://telegra.ph/file/ضع-رابط-الصورة-هنا.jpg',

  // 🤖 اسم البوت يُقرأ من global.botName أو يُكتب يدوياً
  botName: global.botName || 'Bot',
}

// ───────────────────────────────────────
// 🚀 Handler الرئيسي
// ───────────────────────────────────────
let handler = async (m, { conn, usedPrefix }) => {

  const body =
`╭━━━━━━━━━━━━━━━━━━━━╮
┃   🤖 *${CONFIG.botName}* — القائمة
╰━━━━━━━━━━━━━━━━━━━━╯

👋 أهلاً *${m.name}*!

اختر قسماً من الأزرار أدناه 👇`

  const footer = `⚡ ${CONFIG.botName} • القائمة الرئيسية`

  // الأزرار: [[ نص_الزر , معرّف_الأمر ]]
  const buttons = [
    ['🛡️ أوامر الجروبات', 'groupcmds'],
    ['📞 المطور',          'developer'],
  ]

  await conn.sendButton2(
    m.chat,   // jid
    body,     // نص الرسالة
    footer,   // footer
    CONFIG.image, // الصورة
    buttons,  // الأزرار
    null,     // copy
    null,     // urls
    m         // quoted
  )
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = /^(menu|قائمة|منيو)$/i

export default handler

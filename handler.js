import { smsg } from './lib/simple.js'

export async function handler(chatUpdate) {
    try {
        if (!chatUpdate?.messages?.length) return

        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m?.message) return

        if (!global.db?.data)
            await global.loadDatabase()

        m = smsg(this, m)
        if (!m) return

        // تجاهل رسائل البوت نفسه
        if (m.fromMe) return

        // إنشاء المستخدم
        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = {
                premium: false,
                banned: false
            }
        }

        const user = global.db.data.users[m.sender]

        // المستخدم محظور
        if (user.banned) return

        // المالك
        const isROwner = global.owner
            .map(v => Array.isArray(v) ? v[0] : v)
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(m.sender)

        // بريميوم
        const isPrems = isROwner || user.premium

        // بيانات المجموعة
        let groupMetadata = null
        let participants = []
        let isAdmin = false
        let isBotAdmin = false

        if (m.isGroup) {
            try {
                groupMetadata = await this.groupMetadata(m.chat)

                participants = groupMetadata?.participants || []

                const member = participants.find(
                    p => p.id === m.sender
                )

                const bot = participants.find(
                    p => p.id === this.user.jid
                )

                isAdmin =
                    member?.admin === 'admin' ||
                    member?.admin === 'superadmin'

                isBotAdmin =
                    bot?.admin === 'admin' ||
                    bot?.admin === 'superadmin'

            } catch (e) {
                console.error(e)
            }
        }

        const prefix = global.prefix || '.'

        if (!m.text || !m.text.startsWith(prefix))
            return

        const usedPrefix = prefix

        const noPrefix = m.text.slice(prefix.length)

        const [command, ...args] =
            noPrefix.trim().split(/\s+/)

        const text = args.join(' ')

        // البحث عن البلجن المناسب
        for (const name in global.plugins) {

            const plugin = global.plugins[name]

            if (!plugin || plugin.disabled)
                continue

            let accepted = false

            if (plugin.command instanceof RegExp) {

                accepted = plugin.command.test(command)

            } else if (Array.isArray(plugin.command)) {

                accepted = plugin.command
                    .map(v => v.toLowerCase())
                    .includes(command.toLowerCase())

            } else if (typeof plugin.command === 'string') {

                accepted =
                    plugin.command.toLowerCase() ===
                    command.toLowerCase()
            }

            if (!accepted)
                continue

            // صلاحيات المالك
            if (plugin.owner && !isROwner)
                return m.reply('هذا الأمر للمالك فقط')

            // صلاحيات البريميوم
            if (plugin.premium && !isPrems)
                return m.reply('هذا الأمر للمستخدمين المميزين فقط')

            // أوامر الجروبات
            if (plugin.group && !m.isGroup)
                return m.reply('هذا الأمر يعمل داخل المجموعات فقط')

            // أوامر الخاص
            if (plugin.private && m.isGroup)
                return m.reply('هذا الأمر يعمل في الخاص فقط')

            // الأدمن
            if (plugin.admin && !isAdmin)
                return m.reply('هذا الأمر للأدمن فقط')

            // البوت أدمن
            if (plugin.botAdmin && !isBotAdmin)
                return m.reply('يجب أن يكون البوت أدمن لتنفيذ هذا الأمر')

            try {

                await plugin.call(this, m, {
                    conn: this,
                    usedPrefix,
                    command,
                    args,
                    text,
                    isROwner,
                    isPrems,
                    isAdmin,
                    isBotAdmin,
                    groupMetadata,
                    participants
                })

            } catch (err) {

                console.error(
                    `[PLUGIN ERROR] ${name}`,
                    err
                )

                m.reply(
                    'حدث خطأ أثناء تنفيذ الأمر'
                )
            }

            break
        }

    } catch (err) {
        console.error('[HANDLER ERROR]', err)
    }
                  }

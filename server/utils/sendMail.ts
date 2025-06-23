// 伪代码：请根据实际邮件服务（如nodemailer、sendcloud等）实现
import nodemailer from 'nodemailer'

export async function sendMail({ to, subject, html, type = 'qq' }: { to: string, subject: string, html: string, type?: 'qq' | 'gmail' }) {
  let transporter
  if (type === 'qq') {
    transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.QQ_USER || '', // QQ邮箱账号
        pass: process.env.QQ_PASS || '', // QQ邮箱授权码
      },
    })
  } else if (type === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || '', // Gmail账号
        pass: process.env.GMAIL_PASS || '', // Gmail应用专用密码
      },
    })
  } else {
    throw new Error('不支持的邮箱类型')
  }
  await transporter.sendMail({
    from: type === 'qq'
      ? `${process.env.QQ_FROM || process.env.QQ_USER}`
      : `${process.env.GMAIL_FROM || process.env.GMAIL_USER}`,
    to,
    subject,
    html,
  })
}

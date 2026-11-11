import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"

type SmtpOptions = {
  host: string
  port: number
  user: string
  pass: string
  from: string
  from_name?: string
}

type InjectedDependencies = {
  logger: Logger
}

export class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp"
  private transporter: Transporter
  private from: string
  private logger: Logger

  constructor({ logger }: InjectedDependencies, options: SmtpOptions) {
    super()
    this.logger = logger
    this.from = options.from_name ? `"${options.from_name}" <${options.from}>` : options.from

    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      // 465 = TLS implicite. Sur les autres ports on exige STARTTLS : sans
      // requireTLS, nodemailer bascule en clair si la négociation échoue,
      // identifiants compris.
      secure: options.port === 465,
      requireTLS: options.port !== 465,
      auth: {
        user: options.user,
        pass: options.pass,
      },
    })

    logger.info(`SMTP notification provider initialized (${options.host}:${options.port})`)
  }

  async send(notification: any): Promise<any> {
    if (!notification) {
      throw new Error("No notification data provided")
    }

    const to = notification.to
    const from = notification.from?.trim() || this.from

    let subject = ""
    let html = ""

    if (notification.content) {
      subject = notification.content.subject || ""
      html = notification.content.html || ""
    }

    if (!to || !subject) {
      this.logger.warn(`SMTP: Skipping notification — missing to or subject`)
      return {}
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      })

      this.logger.info(`SMTP: Email sent to ${to} — ${info.messageId}`)
      return { id: info.messageId }
    } catch (error: any) {
      this.logger.error(`SMTP: Failed to send to ${to} — ${error.message}`)
      throw error
    }
  }
}

export default SmtpNotificationService

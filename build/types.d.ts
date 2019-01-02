type MailID = number
type UserID = number

interface Mail {
    id: MailID
    userId: UserID
    date: string
    subject: string
    inReplyTo?: MailID
    references?: MailID[]
    replies?: MailID[]
    citations?: MailID[]
}

interface User {
    id: UserID
    name: string
    address: string
    mails: MailID[]
}

export type MailsJSON = Mail[]
export type UsersJSON = User[]

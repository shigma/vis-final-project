type MailID = number
type UserID = number
type ThreadID = number

interface Mail {
    id: MailID
    userId: UserID
    date: string
    subject: string
    inReplyTo?: MailID
    references?: MailID[]
    replies?: MailID[]
    citations?: MailID[]
    threadId: ThreadID
}

interface User {
    id: UserID
    name: string
    address: string
    mails: MailID[]
}

interface Thread {
    id: ThreadID
    users: {
        id: UserID
        mails: MailID[]
    }[]
    mails: MailID[]
}

export type MailsJSON = Mail[]
export type UsersJSON = User[]
export type ThreadsJSON = Thread[]

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
    activity: [string, number][]
    keywords: {
        name: string
        value: number
    }
    relatedUsers: {
        id: UserID
        name: string
        value: number
    }[]
}

interface Thread {
    id: ThreadID
    users: {
        id: UserID
        mails: MailID[]
    }[]
    mails: MailID[]
}

interface Keyword {
    keyword: string
    mails: MailID[]
    activity: [string, number][]
    users: {
        id: UserID
        name: string
        value: number
    }
    relatedKeywords: {
        name: string
        value: number
    }
}

export type MailsJSON = Mail[]
export type UsersJSON = User[]
export type ThreadsJSON = Thread[]

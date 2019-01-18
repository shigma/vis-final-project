/**
 * @file userbuild.js
 * 
 * Take `./dist/meta.json` as input, extract user related data and store in 
 * './dist/user.json' for further visualization
 * 
 * `user.json` is a list of all users in the mailing list, it contains:
 * 1. MailAddress:  The mail of the user
 * 2. Name:         The name of the user
 * 3. MailSent:     A list of messages that were sent by this user
 * 4. MailReceived: A list of messages that reply this user
 * 5. Contacts:     A list of mail addresses that communicated with this user
 * 
 * Here, I use mail address as the identifier for each user, but one user may
 * use several different mails for communication. This need to be tackled later.
 * 
 * @author He, Hao
 * @date   2018-12-26
 */

let fs = require('fs');
let meta_data = require('./dist/meta.json');

// The output data structure that stores user information
let user_info = [];

// Regular expressions for matching email and name respectively
let mail_regex = /([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})|([A-Za-z0-9_\-\.])+\ at ([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})/;
let name_regex = /\(([^)]*)\)/;

// Build data 1, 2, 3 from meta.json
for (let i = 0; i < meta_data.length; ++i) {
    let item = meta_data[i].meta;

    let mail = mail_regex.exec(item.From);
    let name = name_regex.exec(item.From);

    // Discard malformed data
    if (mail === null || name === null) {
        console.log('Discarded malfromed data: ' + item.From);
        continue;
    }

    // Extract needed data from the regex array
    mail = mail[0];
    name = name[1];
    // For future convenience
    meta_data[i].meta.mail = mail;
    meta_data[i].meta.name = name;

    let user_id = -1;
    for (let j = 0; j < user_info.length; ++j) {
        if (user_info[j].MailAddress === mail) {
            user_id = j;
            break;
        }
    }
    if (user_id === -1) { 
        // No user, add a new item
        let user = new Object();
        user.Name = name;
        user.MailAddress = mail;
        user.MailSent = [];
        user.MailReceived = [];
        user.Contacts = [];
        user.MailSent.push(item.MessageID);
        user_info.push(user);
    } else {
        // Add new informaton to existing user
        user_info[user_id].MailSent.push(item.MessageID);
    }
}

// build map of meta_data, messageID as key for fast query of mail info
let meta_data_map = new Map();
for (let i = 0; i < meta_data.length; ++i) {
    let item = meta_data[i].meta;
    meta_data_map.set(item.MessageID, item);
}
let userid_map = new Map();
for (let i = 0; i < user_info.length; ++i) {
    userid_map.set(user_info[i].MailAddress, i);
}

// Build MailReceived and Contact field in user data
for (let i = 0; i < meta_data.length; ++i) {
    let item = meta_data[i].meta;

    // Some reply messages are non-existent in the dataset
    if (meta_data_map.get(item.InReplyTo) === undefined) {
        continue;
    }
    // Some malformed mail are discarded so it may not exist in user list
    if (userid_map.get(item.mail) === undefined) {
        continue;
    }

    let user_id = userid_map.get(item.mail);
    let other = userid_map.get(meta_data_map.get(item.InReplyTo).mail);
    if (other === null) continue; 
    
    user_info[other].MailReceived.push(item.MessageID);

    let contact_id = -1;
    for (let j = 0; j < user_info[user_id].Contacts.length; ++j) {
        if (user_info[other].MailAddress === user_info[user_id].Contacts[j].MailAddress) {
            contact_id = j;
            break;
        }
    }
    if (contact_id === -1) {
        // Add a new contact
        let contact = new Object();
        contact.MailAddress = user_info[other].MailAddress;
        contact.Mail = [item.MessageID];
        user_info[user_id].Contacts.push(contact);
    } else {
        // Add new information to an existing contact
        user_info[user_id].Contacts[contact_id].Mail.push(item.MessageID);
    }
}

console.log('Total number of users: ' + user_info.length);
fs.writeFileSync('./dist/user.json', JSON.stringify(user_info, null, 2));

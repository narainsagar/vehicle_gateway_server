

export enum MESSAGE_TEMPLATES {
    // message templates for regex query
    PATTERN_REPORT = `REPORT. I'M HERE (.+) (.+), (.+) AND CHARGED AT (.+)%.`,
    PATTERN_HELLO = `HELLO, I'M (.+)!`,
    PATTERN_HEY_YOU = `HEY YOU, (.+)!`,
    PATTERN_FINE = `FINE. I'M HERE (.+) (.+), (.+) AND CHARGED AT (.+)%.`,
    PATTERN_KEEP_ME_POSTED = `KEEP ME POSTED EVERY (.+) SECONDS.`,
    PATTERN_WTF = `WTF! (.+)\n(.+)`,

    // static messages
    LOGIN_REPLY = `HI, NICE TO MEET YOU!`,
    INTERVAL_REPLY = `I CAN'T, SORRY.`,
    STATUS_REQUEST = `HOW'S IT GOING?`,
    BLOB_REPLY = `DAAAMN! ISSUE REPORTED ON JIRA`,
    SESSION_END_REQUEST = `GOTTA GO.`,
    SESSION_END_REPLY = `SEE YA!`,

    DONE = `DONE!`,
    STATUS_REPLY = `SURE, I WILL!`,
    PING = 'PING.',
    PONG = 'PONG.',
    THANKS = 'OK, THANKS!',

    MESSAGE_RECEIVED = 'MESSAGE RECEIVED'
}

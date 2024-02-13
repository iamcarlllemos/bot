<<<<<<< HEAD
const fs = require("fs");
const login = require("fca-unofficial");

// Simple echo bot. It will repeat everything that you say.
// Will stop when you say '/stop'
login({appState: JSON.parse(fs.readFileSync('fbstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});

    var stopListening = api.listenMqtt((err, event) => {
        if(err) return console.error(err);

        api.markAsRead(event.threadID, (err) => {
            if(err) console.error(err);
        });

        switch(event.type) {
            case "message":
                api.getThreadInfo(event.threadID, (err, data) => {
                    const name = data.userInfo[0].name;
                    const customMessage = `Hello ${name},\n\nThanks for reaching out! I'm not available on Facebook and Messenger right now. For commissions or inquiries, please email me at iamcarlllemos@gmail.com or message me on Viber at +639364344512. Thanks for your understanding.\n\nBest regards,\nCarl Llemos`;
                    api.sendMessage(customMessage, event.threadID);
                });
                break;
            case "event":
                console.log(event);
                break;
        }
    });
});
=======
import fs from "fs";
import login from "fca-unofficial";
import OpenAI from "openai";
import fetch from "node-fetch";
import { config } from "dotenv";

config();

async function main() {
    try {
        const api = await loginWithAppState();
        setupMessageListener(api);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

async function loginWithAppState() {
    const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

    return new Promise((resolve, reject) => {
        login({ appState }, (err, api) => {
            if (err) {
                reject(err);
            } else {
                resolve(api);
            }
        });
    });
}

function setupMessageListener(api) {
    const stopListening = api.listenMqtt((err, event) => {
        if (err) {
            console.error(err);
            return;
        }

        handleIncomingMessage(api, event);
    });
}

function showMenu() {
    const menu = `1. Search Keyword:\n   - Usage: Input your inquiry after typing 'search'.\n   - Example: Type 'search what is the meaning of www'.\n\n2. MyIP Keyword:\n   - Usage: Simply type 'myip' to retrieve your IP address.\n`;

    return menu;
}


async function handleIncomingMessage(api, event) {
    
    api.markAsRead(event.threadID, (err) => {
        if (err) {
            console.error(err);
        }
    });

    switch (event.type) {
        case "message":
            if(event.body == 'show menu') {
                api.sendMessage(showMenu(), event.threadID);
            } else {
                const prompt = event.body;
                const result = command(prompt);
                if (result.status === 'ok') {
                    api.sendTypingIndicator(event.threadID);
                    switch (result.command) {
                        case 'search':
                            searchAndSendMessage(api, result.prompt, event.threadID);
                            break;
                        case 'myip':
                            myipAndSendMessage(api, event.threadID);
                            break;
                        default:
                            break;
                    }
                } else {
                    const user_id = api.getCurrentUserID();
                    api.getThreadInfo(event.threadID, (err, data) => {
                        if(!data.isGroup) {
                            const name = data.userInfo[0].firstName;
                            const message = `Hello ${name},\n\nThanks for reaching out! I'm currently not available on Facebook and Messenger. For commissions or inquiries, you can email me at iamcarlllemos@gmail.com or message me on Viber at +639364344512. Thanks for your understanding.\n\nBest regards,\nCarl Llemos`;
                            api.setMessageReaction('\u2764', event.messageID);
                            setTimeout(() => {
                                api.sendMessage(message, event.threadID);
                            }, 1500);
                        } else {
                
                            const mentioned_id = Object.keys(event.mentions)[0];
                            const sender_id = event.senderID;
                
                            if(mentioned_id === user_id) {
                                api.getUserInfo(sender_id, (err, data) => {
                                    const name = data[sender_id].firstName;
                                    const message = `Hello ${name},\n\nI'm currently not available on Facebook and Messenger. You can reach me via email at iamcarlllemos@gmail.com or message me on Viber at +6394344512. Have a good day ahead.\n\nBest regards,\nCarl Llemos`;
                                    api.setMessageReaction('\u2764', event.messageID);
                                    setTimeout(() => {
                                        api.sendMessage(message, event.threadID, event.messageID);
                                    }, 1500);
                                });
                            }
                        }
                    });
                }
            }
            break;
        case "message_reply":
            break;
        default:
            break;
    }
}

function command(prompt) {
    const listCommands = ['search', 'myip'];
    const arrayPrompt = prompt.split(' ');
    const command = arrayPrompt[0];

    if (listCommands.includes(command)) {
        arrayPrompt.shift();
        const newPrompt = arrayPrompt.join(' ');
        return {
            'status': 'ok',
            'message': 'Command Found',
            'command': command,
            'prompt': newPrompt
        };
    } else {
        return {
            'status': 'err',
            'message': 'Oops, Invalid Command'
        };
    }
}

async function searchAndSendMessage(api, prompt, threadID) {
    try {
        const result = await search(prompt);
        api.sendMessage(result, threadID);
    } catch (error) {
        console.error("Error during search:", error);
        api.sendMessage('Error during search', threadID);
    }
}

async function myipAndSendMessage(api, threadID) {
    try {
        const result = await myip();
        api.sendMessage(result, threadID);
    } catch (error) {
        console.error("Error getting IP address:", error);
        api.sendMessage('Error getting IP address', threadID);
    }
}

async function search(prompt) {
    const openai = new OpenAI({
        apiKey: process.env.API_KEY
    });
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
}

async function myip() {
    const response = await fetch('https://api.ipify.org/?format=json');
    if (!response.ok) {
        return 'Unable to find your IP address';
    } else {
        const data = await response.json();
        return `Your IP address: ${data.ip}`;
    }
}

main(); 
>>>>>>> ff9c95c (latest)

/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable camelcase */

// [START gmail_quickstart]
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({
        userId: 'me',
    });
    console.log(res.data);
    // const labels = res.data.labels;
    // if (!labels || labels.length === 0) {
    //   console.log('No labels found.');
    //   return;
    // }
    // console.log('Labels:');
    // labels.forEach((label) => {
    //   console.log(`- ${label.name}`);
    // });
}

/**
 * Lists the messages in the user's inbox.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listInbox(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        // The special value 'me' can be used to indicate the authenticated user.
        userId: 'me',
    });
    // console.log(res.data);
    const messages = res.data.messages;
    if (!messages || messages.length === 0) {
        console.log('No messages found.');
        return;
    }
    // console.log('Messages:');
    // messages.forEach((message) => {
    //     console.log(`- ${message.id}`);
    // });
    return messages;
}

/**
 * Gets a messages in the user's inbox.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} messageId An authorized OAuth2 client.
 */
async function getMessage(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.get({
        // The special value 'me' can be used to indicate the authenticated user.
        userId: 'me',
        id: messageId
    });
    return res.data;
    // console.log(res.data);
    // const messages = res.data.messages;
    // if (!messages || messages.length === 0) {
    //     console.log('No messages found.');
    //     return;
    // }
    // console.log('Messages:');
    // messages.forEach((message) => {
    //     console.log(`- ${message.id}`);
    // });
    // return messages;
}

// authorize().then(listLabels).catch(console.error);

// authorize().then(listInbox).catch(console.error);

// authorize().then(listLabels).then(authorize).then(listInbox).catch(console.error);

async function main() {

    try {

        let auth = await authorize();
        let messages = await listInbox(auth);

        messages.forEach(async (message) => {
            let messageContent = await getMessage(auth, message.id);
            console.log(`- ${message.id}`);
            // console.log("- messageContent",messageContent);
            if (messageContent.payload.parts && messageContent.payload.parts.length > 0) {
                if (messageContent.payload.parts[0].body.data) {
                    let data = messageContent.payload.parts[0].body.data;
                    console.log(data);
                    let buff = Buffer.from(data, 'base64');
                    let text = buff.toString('ascii');
                    console.log(text);

                }
            }
        });

        // messages.forEach(async (message) => {
        //     let messageContent = await getMessage(auth, message.id);
        //     console.log(`- ${message.id}`);
        //     // console.log("- messageContent",messageContent);
        //     if (messageContent.payload.parts && messageContent.payload.parts.length > 0) {
        //         let parts = messageContent.payload.parts;
        //         parts.forEach(async (part) => {
        //             if (part.body.data) {
        //                 let data = part.body.data;
        //                 console.log(data);
        //                 let buff = Buffer.from(data, 'base64');
        //                 let text = buff.toString('ascii');
        //                 console.log(text);

        //             }
        //         });
        //     }
        // });

    } catch (error) {
        console.error(error);
    }

}

main();

// [END gmail_quickstart]
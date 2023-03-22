/*
 * File: firebase-config.ts
 * Project: fedt
 * File Created: Wednesday, 15th March 2023 3:48:25 pm
 * Author: Andrei Grichine (andrei.grichine@gmail.com)
 * -----
 * Last Modified: Wednesday, 22nd March 2023 8:47:34 am
 * Modified By: Andrei Grichine (andrei.grichine@gmail.com>)
 * -----
 * Copyright 2022 - 2023, Prime73 Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THESOFTWARE.
 * -----
 * HISTORY:
 */

import * as admin from "firebase-admin";
import serviceAccount from "./config/serviceAccountKey.json";

const emulatorHost = "127.0.0.1";
const emulatorPort = 9199;
// Set the environment variable for the Firebase Storage Emulator
process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${emulatorHost}:${emulatorPort}`;

// Initialize the firebase-admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
});
export { admin };

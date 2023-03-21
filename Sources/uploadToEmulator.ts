/*
 * File: uploadToEmulator.ts
 * Project: fedt
 * File Created: Tuesday, 14th March 2023 6:55:29 pm
 * Author: Andrei Grichine (andrei.grichine@gmail.com)
 * -----
 * Last Modified: Tuesday, 21st March 2023 1:31:53 pm
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

import * as fs from "fs";
import * as path from "path";
import pMap from "p-map";

import { admin as emulatorAdmin } from "./firebase-config";

const localDirectories = [
    { folder: "images", path: "/home/andrei/BPC/Firebase/storage/images" },
    { folder: "agents", path: "/home/andrei/BPC/Firebase/storage/agents" },
    { folder: "property", path: "/home/andrei/BPC/Firebase/storage/property" }
];

/**
 * Function to upload files to the emulator bucket
 *
 * @param {string} bucketName - Name of the bucket to upload to
 * @param {string} directoryPath - Path to the directory containing the files to upload
 * @param {string} folderPath - Path to the folder in the bucket to upload the files to
 * @param {number} maxConcurrentUploads - Maximum number of concurrent uploads
 */
async function uploadFiles(bucketName: string, directoryPath: string, folderPath = "", maxConcurrentUploads = 10): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const bucket = emulatorAdmin.storage().bucket(bucketName);

        fs.readdir(directoryPath, async (err, items) => {
            if (err) {
                console.error("Unable to read directory:", err);
                reject(err);
                return;
            }

            const uploadItem = async (item: string) => {
                const itemPath = path.join(directoryPath, item);
                const itemStat = fs.statSync(itemPath);

                if (itemStat.isFile()) {
                    const fileUploadOptions = { destination: path.join(folderPath, item), resumable: false };

                    try {
                        await bucket.upload(itemPath, fileUploadOptions);
                        console.log(`File '${item}' uploaded successfully.`);
                    } catch (error) {
                        console.error(`Error uploading file '${item}':`, error);
                        throw error;
                    }
                } else if (itemStat.isDirectory()) {
                    // Recursively upload files in the subdirectory
                    const subFolderPath = path.join(folderPath, item);
                    await uploadFiles(bucketName, itemPath, subFolderPath, maxConcurrentUploads);
                }
            };

            try {
                await pMap(items, uploadItem, { concurrency: maxConcurrentUploads });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * Main function to upload files to the emulator bucket
 */
async function main() {
    try {
        for (const { folder, path: dirPath } of localDirectories) {
            await uploadFiles(emulatorAdmin.storage().bucket().name, dirPath, folder)
                .then(() => {
                    console.log("All files uploaded successfully.");
                })
                .catch((error) => {
                    console.error("Error occurred during file upload:", error);
                });
        }
    } catch (error) {
        console.error("Error occurred during file upload:", error);
    }
}

main().catch((error) => {
    console.error("An unexpected error occurred:", error);
});

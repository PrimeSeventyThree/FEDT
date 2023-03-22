/*
 * File: uploadToEmulator.ts
 * Project: fedt
 * File Created: Tuesday, 14th March 2023 6:55:29 pm
 * Author: Andrei Grichine (andrei.grichine@gmail.com)
 * -----
 * Last Modified: Tuesday, 21st March 2023 10:03:26 pm
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
 * Function to delay execution
 *
 * @param {number} ms - Number of milliseconds to delay execution
 * @returns {Promise<void>} - Promise that resolves after the specified delay
 */
async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Function to upload files to the emulator bucket
 *
 * @param {string} bucketName - Name of the bucket to upload to
 * @param {string} directoryPath - Path to the directory containing the files to upload
 * @param {string} folderPath - Path to the folder in the bucket to upload the files to
 * @param {number} maxConcurrentUploads - Maximum number of concurrent uploads
 */
async function uploadFiles(bucketName: string, directoryPath: string, folderPath = "", maxConcurrentUploads = 2, delayBetweenBatches = 5000): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
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
                    const fileUploadOptions = {
                        destination: path.join(folderPath, item),
                        resumable: false
                    };
                    const file = bucket.file(fileUploadOptions.destination);
                    try {
                        const [exists] = await file.exists();

                        if (exists) {
                            // console.log(`File '${fileUploadOptions.destination}' already exists in storage.`);
                            return;
                        }
                    } catch (error) {
                        console.error(`Error checking if file '${fileUploadOptions.destination}' exists:`, error);
                        throw error;
                    }

                    try {
                        await bucket.upload(itemPath, fileUploadOptions);
                        // console.log(`File '${item}' uploaded successfully.`);
                    } catch (error) {
                        console.error(`Error uploading file '${item}':`, error);
                        throw error;
                    }
                } else if (itemStat.isDirectory()) {
                    const subFolderPath = path.join(folderPath, item);
                    await uploadFiles(bucketName, itemPath, subFolderPath, maxConcurrentUploads, delayBetweenBatches);
                }
            };

            try {
                await pMap(items, uploadItem, {
                    concurrency: maxConcurrentUploads
                });
                // console.log(`Batch uploaded successfully. Waiting for next batch...`);
                await delay(delayBetweenBatches);
                resolve();
            } catch (error) {
                console.error(`Error uploading batch:`, error);
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
            console.log(`Uploading files from '${dirPath}'...`);
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

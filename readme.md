Firebase Storage Emulator Data Transfer

This project provides a solution to help developers transfer and
synchronize their production data with the Firebase Storage Emulator,
enabling them to test their applications more effectively using real
data. The project includes a TypeScript script that reads files from
local directories containing the exported production data and uploads
them to the Firebase Storage Emulator, preserving the original directory
structure and limiting the number of concurrent uploads.

The solution provided in this project leverages the Firebase Admin SDK
to connect to the Firebase Storage Emulator automatically. This
connection is made possible by setting the
FIREBASE_STORAGE_EMULATOR_HOST environment variable:

```bash
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
```
If you're intested in more details about how this works, check out the
[documentation](https://firebase.google.com/docs/emulator-suite/connect_storage#node.js_1).

By setting this variable, the Firebase Admin SDK will be able to
communicate with the Firebase Storage Emulator running on your local
machine (in this case, on localhost:9199). This allows you to easily
upload local files to the emulator's storage, which can be helpful for
testing or development purposes.

## Table of Contents

 
- [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Usage](#usage)
  - [Using Firebase Emulator with Real Data](#using-firebase-emulator-with-real-data)
  - [Contributing](#contributing)
  - [License](#license)

### Prerequisites

To use this project, you will need:

1. Node.js and npm installed on your machine
2. Firebase CLI installed and set up
3. A Firebase project with a Firestore storage bucket
4. A local Firebase Storage Emulator running
5. A local directory containing the exported production data
### Setup

To set up the project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/PrimeSeventyThree/FEDT.git

cd FEDT
```
2. Install the required dependencies:
```bash
npm install
```
3. Download the Firebase Admin SDK service account key from the Firebase Console and save it as serviceAccountKey.json in your project folder.
4. Update the firebase-config.ts file with your emulator bucket:
```typescript

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "my-emulator-bucket", // Replace this with your emulator bucket name
});

export { admin };
```
5. Update the uploadToEmulator.ts file with the paths to your local directories containing the exported production data:
```typescript

const localDirectories = [
  { folder: "images", path: "/path/to/your/local/data/images" },
  { folder: "icons", path: "/path/to/your/local/data/icons" },
  { folder: "photos", path: "/path/to/your/local/data/photos" },
];
```
### Usage

To use the data transfer script, follow these steps:

1. Compile the TypeScript files:
```bash
npm build
```
2. Run firebase storage emulator with --export-on-exit option. This start the emulator with *empty data* and exports the data to the specified directory when the emulator exits:
```bash
firebase emulators:start --only storage  --export-on-exit=/path/to/your/local/data/storage
```
3. Run the generated JavaScript file:
```bash
npm start
```
*A word of warning:* the script will upload all the files in the specified directories to the Firebase Storage Emulator. If you have a large number of files, this may take a while. Also, the script will upload the files concurrently, so you may want to limit the number of concurrent uploads by updating the maxConcurrentUploads variable in the uploadToEmulator.ts file.

The script will upload the files to the local Firebase Storage Emulator, preserving the original directory structure. Once the script finishes, you can stop the Firebase Emulator and the data will be exported to the specified (via --export-on-exit) directory.

### Using Firebase Emulator with Real Data

To start the Firebase Emulator with real data from a previously exported dataset, you can use the --import and --export-on-exit options in the firebase emulators:start command. The --import option allows you to import data from a specified directory, while the --export-on-exit option will export the emulator data to the same directory when the emulator exits, preserving any changes made to the data.

For example:
```bash
firebase emulators:start --import=/path/to/your/local/data/storage --export-on-exit
```
This command starts the Firebase Emulator and imports the data from the /path/to/your/local/data/storage directory. When the emulator is stopped, the data will be exported back to the same directory.

### Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue to report bugs, request features, or provide feedback.

### License

This project is licensed under the MIT License. See LICENSE for more
information.

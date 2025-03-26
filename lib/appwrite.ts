// lib/appwrite.ts
import { Client, Account, Users } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const account = new Account(client);
const users = new Users(client);

export { client, account, users };

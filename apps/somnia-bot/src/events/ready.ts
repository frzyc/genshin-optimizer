import { Client, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export async function run (client : Client) {
  console.log(`ready`);
}

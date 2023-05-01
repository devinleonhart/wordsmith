import { Types } from "mongoose";
import { Character, Game } from "./models";
import { WordsmithError } from "../classes/wordsmithError";

export const addCharacter = async(sco:SlashCommandOptions) => {

  const gameID = await findGameByDiscordChannelID(sco.discordChannelID);

  try {
    const game = await Game.findById(gameID);
    const character = await Character.create({
      name: sco.options?.characterName,
      owner: sco.playerID,
      items: [],
      words: [],
      star: false
    });
    game?.characters.push(character);
    game?.save();
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("addCharacter has failed..."));
  }
};

export const addItem = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if(sco.options?.item && !character?.items.includes(sco.options.item)) {
      character?.items.push(sco.options.item);
      await character?.save();
    }
    else {
      throw new WordsmithError(`${character?.name} already has that item!`);
    }
  }
  catch(error) {
    if(error instanceof WordsmithError) {
      throw(error);
    }
    else {
      console.error(error);
      throw(new WordsmithError("addItem has failed..."));
    }
  }
};

export const addStar = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if(character) {
      character.star = true;
      await character.save();
    }
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("addStar has failed..."));
  }
};

export const addWord = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if(sco.options?.word && !character?.words.includes(sco.options.word)) {
      character?.words.push(sco.options.word);
      await character?.save();
    }
    else {
      throw new WordsmithError(`${character?.name} already has that word!`);
    }
  }
  catch(error) {
    if(error instanceof WordsmithError) {
      throw(error);
    }
    else {
      console.error(error);
      throw(new WordsmithError("addWord has failed..."));
    }
  }
};

export const createGame = async(sco:SlashCommandOptions) => {

  const game = await findGameByDiscordChannelID(sco.discordChannelID);

  if(game) {
    throw new WordsmithError("A game already exists for this channel!");
  }
  try {
    await Game.create({
      discordChannelID: sco.discordChannelID,
      characters: []
    });
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("createGame has failed..."));
  }
};

export const findCharacterInGameByOwner = async(userID: string, discordChannelID: string) => {

  const game = await Game.findOne({discordChannelID: discordChannelID});
  const character = game?.characters.find((character) => character.owner == userID);

  try {
    if(character) {
      return character._id;
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("findCharacterInGameByOwner has failed..."));
  }
};

export const findGameByDiscordChannelID = async(channelID: string):Promise<Types.ObjectId | null> => {
  try {
    const game = await Game.findOne({discordChannelID: channelID});
    if(game) {
      return game._id;
    }
    return null;
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("findGameByDiscordChannelID has failed..."));
  }
};

export const getCharacterData = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if(character) {
      return {
        name: character.name,
        items: character.items,
        star: character.star,
        words: character.words
      } as CharacterData;
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("getCharacterData has failed..."));
  }
};

export const removeCharacter = async(sco:SlashCommandOptions) => {

  const gameID = await findGameByDiscordChannelID(sco.discordChannelID);
  let characterID;
  try {
    characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);
  }
  catch(error) {
    throw new WordsmithError("You do not have a character in this game!");
  }

  try {
    const game = await Game.findById(gameID);
    await game?.characters.pull({_id: characterID});
    game?.save();
    await Character.deleteOne({_id: characterID});
  }
  catch(error) {
    console.error(error);
    throw(new WordsmithError("removeCharacter has failed..."));
  }


};

export const removeItem = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if (sco.options?.item && character?.items.includes(sco.options.item)) {
      character.items = character.items.filter((item) => {
        return item !== sco.options?.item;
      });
      await character.save();
    }
    else {
      throw new WordsmithError(`${character?.name} does not have ${sco.options?.item}!`);
    }
  }
  catch(error) {
    if(error instanceof WordsmithError) {
      throw(error);
    }
    else {
      console.error(error);
      throw(new WordsmithError("removeItem has failed..."));
    }
  }
};

export const removeStar = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if(character) {
      if(!character.star) {
        throw new WordsmithError(`${character.name} doesn't have a star!`);
      }
      character.star = false;
      await character.save();
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    if(error instanceof WordsmithError) {
      throw(error);
    }
    else {
      console.error(error);
      throw(new WordsmithError("removeStar has failed..."));
    }
  }
};

export const removeWord = async(sco:SlashCommandOptions) => {

  const characterID = await findCharacterInGameByOwner(sco.playerID, sco.discordChannelID);

  try {
    const character = await Character.findById(characterID);
    if (sco.options?.word && character?.words.includes(sco.options?.word)) {
      character.words = character.words.filter((word) => {
        return word !== sco.options?.word;
      });
      await character.save();
    }
    else {
      throw new WordsmithError(`${character?.name} does not have ${sco.options?.word}!`);
    }
  }
  catch(error) {
    if(error instanceof WordsmithError) {
      throw(error);
    }
    else {
      console.error(error);
      throw(new WordsmithError("removeWord has failed..."));
    }
  }
};

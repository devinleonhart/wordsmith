import { Types } from "mongoose";
import { Character, Game } from "./models";
import { WordsmithError } from "../classes/wordsmithError"

// Character

export const createCharacter = async(characterName: string, gameID: Types.ObjectId, userID: string) => {
  try {
    const game = await Game.findById(gameID);
    if(game) {
      const character = await Character.create({
        name: characterName,
        owner: userID,
        items: [],
        words: [],
        star: false
      });
      game.characters.push(character);
      game.save();
    }
    else {
      throw new Error("Game not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("createCharacter has failed..."))
  }
};

export const deleteCharacter = async(characterID: Types.ObjectId, discordChannelID: string) => {
  try {
    const gameID = await findGameByDiscordChannelID(discordChannelID)
    const game = await Game.findById(gameID)

    if(game) {
      await game.characters.pull({_id: characterID});
      game.save();
      Character.deleteOne({characterID: characterID})
    }
    else {
      throw new Error("Game not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("deleteCharacter has failed..."))
  }
};

export const findCharacterByOwner = async(userID: string, discordChannelID: string) => {

  const game = await Game.findOne({discordChannelID: discordChannelID})
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
    console.error(error)
    throw(new WordsmithError("findCharacterByOwner has failed..."))
  }
};

export const getCharacterData = async(characterID: Types.ObjectId) => {
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
    console.error(error)
    throw(new WordsmithError("getCharacterData has failed..."))
  }
};

export const awardCharacterStar = async(characterID: Types.ObjectId) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      character.star = true;
      await character.save();
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("awardCharacterStar has failed..."))
  }
};

export const awardCharacterWord = async(characterID: Types.ObjectId, word: string) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      if(!character.words.includes(word)) {
        character.words.push(word);
        await character.save();
      }
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("awardCharacterWord has failed..."))
  }
};

export const awardCharacterItem = async(characterID: Types.ObjectId, item: string) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      if(!character.items.includes(item)) {
        character.items.push(item);
        await character.save();
      }
    }
    else {
      throw new WordsmithError("Character not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("awardCharacterItem has failed..."))
  }
};

export const removeCharacterItem = async(characterID: Types.ObjectId, itemToRemove: string) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      if (character.items.includes(itemToRemove)) {
        character.items = character.items.filter((item) => {
          item !== itemToRemove;
        });
        await character.save();
      }
      else {
        throw new WordsmithError(`The character does not have the item ${itemToRemove}!`);
      }
    }
    else {
      throw new WordsmithError("Character not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("removeCharacterItem has failed..."))
  }
};

export const removeCharacterWord = async(characterID: Types.ObjectId, wordToRemove: string) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      if (character.words.includes(wordToRemove)) {
        character.words = character.words.filter((word) => {
          word !== wordToRemove;
        });
        await character.save();
      }
      else {
        throw new Error(`The character does not have the word ${wordToRemove}!`);
      }
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("removeCharacterWord has failed..."))
  }
};

export const useCharacterStar = async(characterID: Types.ObjectId) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      character.star = false;
      await character.save();
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("useCharacterStar has failed..."))
  }
};

// Game

export const createGame = async(discordChannelID: string) => {
  const game = await findGameByDiscordChannelID(discordChannelID)
  if(game) {
    throw new WordsmithError("A game already exists for this channel!")
  }
  try {
    await Game.create({
      discordChannelID,
      characters: []
    });
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("createGame has failed..."))
  }
};

export const deleteGame = async(discordChannelID: string) => {
  try {
    const game = await Game.findOne({discordChannelID: discordChannelID})
    if(game) {
      game.characters.forEach(async (character) => {
        await Character.deleteOne(character._id)
      });
      await Game.deleteOne(game._id);
    }
    else {
      throw new WordsmithError("Cannot delete! No game was found!")
    }
  }
  catch(error) {
    console.error(error)
    throw(new WordsmithError("deleteGame has failed..."))
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
    console.error(error)
    throw(new WordsmithError("findGameByDiscordChannelID has failed..."))
  }
};

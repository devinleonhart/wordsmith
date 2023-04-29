import { Types } from "mongoose";
import { Character, Game } from "./models";

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
    console.error("createCharacter has failed...");
    console.error(error);
  }
};

export const deleteCharacter = async(characterID: Types.ObjectId, gameID: Types.ObjectId) => {
  try {
    const game = await Game.findById(gameID);
    if(game) {
      await game.characters.pull({_id: characterID});
      game.save();
    }
    else {
      throw new Error("Game not found!");
    }
  }
  catch(error) {
    console.error("deleteCharacter has failed...");
    console.error(error);
  }
};

export const findCharacterByID = async(characterID: Types.ObjectId) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      return character._id;
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error("findCharacter has failed...");
    console.error(error);
  }
};

export const findCharacterByName = async(name: string) => {
  try {
    const character = await Character.findOne({name});
    if(character) {
      return character._id;
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error("findCharacterByName has failed...");
    console.error(error);
  }
};

export const findCharacterByOwner = async(userID: string) => {
  try {
    const character = await Character.findOne({owner: userID});
    if(character) {
      return character._id;
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error("findCharacterByName has failed...");
    console.error(error);
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
    console.error("getCharacterData has failed...");
    console.error(error);
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
    console.error("awardCharacterStar has failed...");
    console.error(error);
  }
};

export const awardCharacterWord = async(characterID: Types.ObjectId, word: string) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      character.words.push(word);
      await character.save();
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error("awardCharacterWord has failed...");
    console.error(error);
  }
};

export const awardCharacterItem = async(characterID: Types.ObjectId, item: string) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      character.items.push(item);
      await character.save();
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error("awardCharacterItem has failed...");
    console.error(error);
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
        throw new Error(`The character does not have the item ${itemToRemove}!`);
      }
    }
    else {
      throw new Error("Character not found!");
    }
  }
  catch(error) {
    console.error("removeCharacterItem has failed...");
    console.error(error);
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
    console.error("removeCharacterWord has failed...");
    console.error(error);
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
    console.error("useCharacterStar has failed...");
    console.error(error);
  }
};

// Game

export const createGame = async(discordChannelID: string) => {
  try {
    await Game.create({
      discordChannelID,
      characters: []
    });
  }
  catch(error) {
    console.error("createGame has failed...");
    console.error(error);
  }
};

export const deleteGame = async(gameID: Types.ObjectId) => {
  try {
    await Game.deleteOne(gameID);
  }
  catch(error) {
    console.error("deleteGame has failed...");
    console.error(error);
  }
};

export const findGameByID = async(gameID: Types.ObjectId) => {
  try {
    const game = await Game.findById(gameID);
    if(game) {
      return game._id;
    }
    else {
      throw new Error("Game not found!");
    }
  }
  catch(error) {
    console.error("findGame has failed...");
    console.error(error);
  }
};

export const findGameByDiscordChannelID = async(channelID: string):Promise<Types.ObjectId | undefined> => {
  try {
    const game = await Game.findOne({discordChannelID: channelID});
    if(game) {
      return game._id;
    }
    else {
      throw new Error("Game not found!");
    }
  }
  catch(error) {
    console.error("findGame has failed...");
    console.error(error);
  }
};

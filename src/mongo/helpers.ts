import { Types } from "mongoose";
import { Character, Game, User } from "./models";

// Character

export const createCharacter = async(characterName: string, gameID: Types.ObjectId, userID: Types.ObjectId) => {
  try {
    const user = await User.findById(userID);
    if(user) {
      const game = await Game.findById(gameID);
      if(game) {
        const character = await Character.create({
          name: characterName,
          owner: user._id,
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
    } else {
      throw new Error("User not found!");
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

export const findCharacter = async(characterID: Types.ObjectId) => {
  try {
    const character = await Character.findById(characterID);
    if(character) {
      return character;
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
      character.items = character.items.filter((item) => {
        item !== itemToRemove;
      });
      await character.save();
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
      character.words = character.words.filter((word) => {
        word !== wordToRemove;
      });
      await character.save();
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

export const findGame = async(gameID: Types.ObjectId) => {
  try {
    const game = await Game.findById(gameID);
    if(game) {
      return game;
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

// User

export const createUser = async(discordUserID: string) => {
  try {
    await User.create({
      discordUserID,
      games: []
    });
  }
  catch(error) {
    console.error("createUser has failed...");
    console.error(error);
  }
};

export const deleteUser = async(userID: Types.ObjectId) => {
  try {
    await User.deleteOne(userID);
  }
  catch(error) {
    console.error("deleteUser has failed...");
    console.error(error);
  }
};

export const findUser = async(userID: Types.ObjectId) => {
  try {
    const user = await User.findById(userID);
    if(user) {
      return user;
    }
    else {
      throw new Error("User not found!");
    }
  }
  catch(error) {
    console.error("findUser has failed...");
    console.error(error);
  }
};

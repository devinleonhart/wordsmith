import { type Types } from 'mongoose'
import { Character, Game } from './models'
import { WordsmithError } from '../classes/wordsmithError'

export const addCharacter = async (sco: SlashCommandOptions) => {
  const gameID = await findGameByDiscordChannelID(sco.discordChannelID)

  try {
    const game = await Game.findById(gameID)
    const character = await Character.create({
      name: sco.options?.characterName,
      owner: sco.playerID,
      active: true, // Creating a character makes it your active character.
      items: [],
      words: [],
      star: false
    })
    if (character) {
      // Deactivate all characters other than the new one.
      game?.characters.forEach((character) => {
        character.active = false
      })
      game?.characters.push(character)
      await game?.save()
    }
  } catch (error) {
    console.error(error)
    throw new WordsmithError('addCharacter has failed...')
  }
}

export const addItem = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )

  try {
    const character = await Character.findById(characterID)
    if (sco.options?.item && !character?.items.includes(sco.options.item)) {
      character?.items.push(sco.options.item)
      await character?.save()
    } else {
      throw new WordsmithError(`${character?.name} already has that item!`)
    }
  } catch (error) {
    if (error instanceof WordsmithError) {
      throw error
    } else {
      console.error(error)
      throw new WordsmithError('addItem has failed...')
    }
  }
}

export const addWord = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )

  try {
    const character = await Character.findById(characterID)
    if (sco.options?.word && !character?.words.includes(sco.options.word)) {
      character?.words.push(sco.options.word)
      await character?.save()
    } else {
      throw new WordsmithError(`${character?.name} already has that word!`)
    }
  } catch (error) {
    if (error instanceof WordsmithError) {
      throw error
    } else {
      console.error(error)
      throw new WordsmithError('addWord has failed...')
    }
  }
}

export const awardStar = async (sco: SlashCommandOptions) => {
  const game = await findGameByDiscordChannelID(sco.discordChannelID)
  let callingUserIsGM: boolean | undefined = false

  if (game) {
    callingUserIsGM = await isGM(sco.playerID, game._id)
  }

  if (callingUserIsGM && sco.options?.user) {
    const characterID = await findActiveCharacterInGameByOwner(
      sco.options?.user,
      sco.discordChannelID
    )

    try {
      const character = await Character.findById(characterID)
      if (character) {
        character.star = true
        await character.save()
      } else {
        throw new WordsmithError(
          "The player you selected doesn't have a character."
        )
      }
    } catch (error) {
      if (error instanceof WordsmithError) {
        throw error
      } else {
        console.error(error)
        throw new WordsmithError('awardStar has failed...')
      }
    }
  } else {
    throw new WordsmithError('Only the GM can award stars!')
  }
}

export const createGame = async (sco: SlashCommandOptions) => {
  const game = await findGameByDiscordChannelID(sco.discordChannelID)

  if (game) {
    throw new WordsmithError('A game already exists for this channel!')
  }
  try {
    await Game.create({
      discordChannelID: sco.discordChannelID,
      gm: sco.playerID,
      characters: []
    })
  } catch (error) {
    console.error(error)
    throw new WordsmithError('createGame has failed...')
  }
}

export const findGameByDiscordChannelID = async (
  channelID: string
): Promise<Types.ObjectId | null> => {
  try {
    const game = await Game.findOne({ discordChannelID: channelID })
    if (game) {
      return game._id
    }
    return null
  } catch (error) {
    console.error(error)
    throw new WordsmithError('findGameByDiscordChannelID has failed...')
  }
}

export const getAllCharactersForPlayerInGame = async (
  sco: SlashCommandOptions
) => {
  const gameID = await findGameByDiscordChannelID(sco.discordChannelID)
  try {
    const game = await Game.findById(gameID)
    const charactersForPlayer = game?.characters.filter((character) => {
      return character.owner === sco.playerID
    })
    return charactersForPlayer
  } catch (error) {
    console.error(error)
    throw new WordsmithError('getAllCharactersForPlayerInGame has failed...')
  }
}

export const getCharacterData = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )

  if (!characterID) {
    throw new WordsmithError(
      'There is no character data to show! Add a character!'
    )
  }

  try {
    const character = await Character.findById(characterID)
    if (character) {
      const payload: WSCharacterData = {
        name: character.name,
        items: character.items,
        star: character.star,
        words: character.words
      }
      return payload
    }
  } catch (error) {
    console.error(error)
    throw new WordsmithError('getCharacterData has failed...')
  }
}

export const removeCharacter = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )
  const gameID = await findGameByDiscordChannelID(sco.discordChannelID)

  if (!characterID) {
    throw new WordsmithError('You do not have a character in this game!')
  }

  try {
    const game = await Game.findById(gameID)
    if (game && game.characters) {
      game?.characters.pull({ _id: characterID })
      // Because the active character is being deleted, activate another character.
      if (game.characters[0]) {
        game.characters[0].active = true
      }
      await game?.save()
      await Character.deleteOne({ _id: characterID })
    }
  } catch (error) {
    console.error(error)
    throw new WordsmithError('removeCharacter has failed...')
  }
}

export const removeItem = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )

  try {
    const character = await Character.findById(characterID)
    if (sco.options?.item && character?.items.includes(sco.options.item)) {
      character.items = character.items.filter((item) => {
        return item !== sco.options?.item
      })
      await character.save()
    } else {
      throw new WordsmithError(
        `${character?.name} does not have ${sco.options?.item}!`
      )
    }
  } catch (error) {
    if (error instanceof WordsmithError) {
      throw error
    } else {
      console.error(error)
      throw new WordsmithError('removeItem has failed...')
    }
  }
}

export const removeWord = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )

  try {
    const character = await Character.findById(characterID)
    if (sco.options?.word && character?.words.includes(sco.options?.word)) {
      character.words = character.words.filter((word) => {
        return word !== sco.options?.word
      })
      await character.save()
    } else {
      throw new WordsmithError(
        `${character?.name} does not have ${sco.options?.word}!`
      )
    }
  } catch (error) {
    if (error instanceof WordsmithError) {
      throw error
    } else {
      console.error(error)
      throw new WordsmithError('removeWord has failed...')
    }
  }
}

export const switchActiveCharacter = async (sco: SlashCommandOptions) => {
  try {
    const gameID = await findGameByDiscordChannelID(sco.discordChannelID)
    const game = await Game.findById(gameID)
    if (game) {
      for (const character of game.characters) {
        if (character.owner === sco.playerID) {
          character.active = character._id?.toString() === sco.options?.characterID
        }
      }
      await game.save()
    }
  } catch (error) {
    console.error(error)
    throw new WordsmithError('getCharacterData has failed...')
  }
}

export const switchGM = async (sco: SlashCommandOptions) => {
  const gameID = await findGameByDiscordChannelID(sco.discordChannelID)
  let callingUserIsGM: boolean | undefined = false

  if (gameID) {
    callingUserIsGM = await isGM(sco.playerID, gameID)
  }

  if (callingUserIsGM) {
    try {
      const game = await Game.findById(gameID)
      if (game && sco.options?.user) {
        game.gm = sco.options?.user
        await game.save()
      }
    } catch (error) {
      console.error(error)
      throw new WordsmithError('switchGM has failed...')
    }
  } else {
    throw new WordsmithError('Only the GM can switch GMs!')
  }
}

export const useStar = async (sco: SlashCommandOptions) => {
  const characterID = await findActiveCharacterInGameByOwner(
    sco.playerID,
    sco.discordChannelID
  )

  try {
    const character = await Character.findById(characterID)
    if (character) {
      if (!character.star) {
        throw new WordsmithError(`${character.name} doesn't have a star!`)
      }
      character.star = false
      await character.save()
    } else {
      throw new WordsmithError(
        'You do not have a character! Create one first!'
      )
    }
  } catch (error) {
    if (error instanceof WordsmithError) {
      throw error
    } else {
      console.error(error)
      throw new WordsmithError('removeStar has failed...')
    }
  }
}

async function findActiveCharacterInGameByOwner (
  userID: string,
  discordChannelID: string
): Promise<Types.ObjectId | undefined> {
  try {
    const game = await Game.findOne({ discordChannelID })
    const character = game?.characters.find((character) => {
      return character.owner === userID && character.active
    })
    return character?._id
  } catch (error) {
    console.error(error)
    throw new WordsmithError('findActiveCharacterInGameByOwner has failed...')
  }
}

async function isGM (
  playerID: string,
  gameID: Types.ObjectId
): Promise<boolean | undefined> {
  try {
    const game = await Game.findById(gameID)
    if (game) {
      return game.gm === playerID
    }
  } catch (error) {
    if (error instanceof WordsmithError) {
      throw error
    } else {
      console.error(error)
      throw new WordsmithError('isGM has failed...')
    }
  }
}

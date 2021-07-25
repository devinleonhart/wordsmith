import redis from "redis";
import settings from "./settings";

type callback = (value: string | null) => void;

let redisClient;

function setupRedisClient():void {
  redisClient = redis.createClient({
    host: settings.redisHost,
    port: settings.redisPort,
  });

  redisClient.on("error", function(error) {
    console.error(error);
  });
}

function redisGet(character:string, key:string, cb:callback):void {
  redisClient.get(`${character.toLowerCase()}_${key.toLowerCase()}`, (err, value) => {
    cb(value);
  });
}

function redisSet(character:string, key:string, value:string, cb:callback):void {
  redisClient.set(`${character.toLowerCase()}_${key.toLowerCase()}`, value, () => {
    cb(null);
  });
}

export {
  setupRedisClient,
  redisGet,
  redisSet
};

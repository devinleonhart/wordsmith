import * as redis from "redis";

type callback = (value?: string) => void;

let redisClient = null;

function setupRedisClient():void {
  redisClient = redis.createClient();

  redisClient.on("error", function(error) {
    console.error(error);
  });
}

function redisGet(character:string, key:string, cb:callback):void {
  redisClient.get(`${character.toLowerCase()}_${key.toLowerCase()}`, (err:Error, value:string) => {
    cb(value);
  });
}

function redisSet(character:string, key:string, value:string, cb:callback):void {
  redisClient.set(`${character.toLowerCase()}_${key.toLowerCase()}`, value, () => {
    cb();
  });
}

export {
  setupRedisClient,
  redisGet,
  redisSet
};

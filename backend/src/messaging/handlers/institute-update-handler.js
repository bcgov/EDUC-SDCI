"use strict";
const log = require("../../components/logger");
const CONSTANTS = require("../../util/constants");
const NATS = require("../message-pub-sub");
const cacheService = require("../../components/cache-service");

async function subscribeToInstituteAPIMessageTopic(nats) {
  const DEBOUNCE_TIMER_MS = 1800000; // 30 minutes
  const opts = {};
  let debounceTimer = null;
  try {
    const sub = nats.subscribe("INSTITUTE_CACHE_REFRESH_TOPIC", opts);
    log.info(`Service listening to INSTITUTE_CACHE_REFRESH_TOPIC`);
    for await (const msg of sub) {
      log.info(
        `Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] ::`,
      );
      // Log only relevant properties to avoid circular structure errors
      let messageData = null;
      try {
        const sc = nats.StringCodec
          ? nats.StringCodec()
          : require("nats").StringCodec();
        messageData = sc.decode(msg.data);
      } catch (e) {
        messageData = "[unavailable]";
      }
      log.info(
        `Message details: subject=${msg.subject}, sid=${msg.sid}, reply=${msg.reply}, data=${messageData}`,
      );
      // Debounce the cache update log
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        (async () => {
          const now = new Date().toISOString();
          log.info(`UPDATED CACHE`);
          await cacheService.loadSchoolandDistrictCache();
          debounceTimer = null;
        })();
      }, DEBOUNCE_TIMER_MS);
    }
  } catch (error) {
    log.error(
      `Error subscribing to INSTITUTE_CACHE_REFRESH_TOPICL: ${error.message}`,
    );
  }
}

const InstituteMessageHandler = {
  subscribe() {
    console.log("Subscribing to institute API message topic...");
    subscribeToInstituteAPIMessageTopic(NATS.getConnection());
  },
};

module.exports = InstituteMessageHandler;

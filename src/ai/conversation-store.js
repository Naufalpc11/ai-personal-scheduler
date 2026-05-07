const fs = require("fs");
const path = require("path");

const storePath = path.join(__dirname, "runtime", "pending-interactions.json");

const readStore = () => {
  try {
    const content = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(content);

    return parsed && typeof parsed === "object" ? parsed : { users: {} };
  } catch (_error) {
    return { users: {} };
  }
};

const writeStore = (store) => {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
};

const getUserState = (store, userId) => store.users?.[String(userId)] || {};

const setUserState = (store, userId, state) => {
  store.users = store.users || {};
  store.users[String(userId)] = state;
  writeStore(store);
  return store.users[String(userId)];
};

const getPendingInteraction = (userId) => {
  const store = readStore();
  return getUserState(store, userId);
};

const savePendingInteraction = (userId, interaction) => {
  const store = readStore();
  return setUserState(store, userId, {
    ...getUserState(store, userId),
    ...interaction,
    updatedAt: new Date().toISOString(),
  });
};

const clearPendingInteraction = (userId) => {
  const store = readStore();
  if (!store.users?.[String(userId)]) {
    return false;
  }

  delete store.users[String(userId)];
  writeStore(store);
  return true;
};

const clearPendingDraft = (userId) => {
  const store = readStore();
  const current = getUserState(store, userId);

  if (!current.pendingDraft) {
    return false;
  }

  const nextState = { ...current };
  delete nextState.pendingDraft;
  if (!nextState.pendingClarification) {
    delete store.users[String(userId)];
  } else {
    store.users = store.users || {};
    store.users[String(userId)] = nextState;
  }

  writeStore(store);
  return true;
};

module.exports = {
  clearPendingDraft,
  clearPendingInteraction,
  getPendingInteraction,
  savePendingInteraction,
};
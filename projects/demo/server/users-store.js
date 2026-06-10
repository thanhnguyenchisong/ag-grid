/** @typedef {{ id: string; name: string; email: string; createdAt: string }} UserRow */

/** @type {UserRow[]} */
const INITIAL = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: '2025-01-15' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', createdAt: '2025-02-20' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', createdAt: '2025-03-10' },
  { id: '4', name: 'Katherine Johnson', email: 'katherine@example.com', createdAt: '2025-04-05' },
  { id: '5', name: 'Tim Berners-Lee', email: 'tim@example.com', createdAt: '2025-05-18' },
  { id: '6', name: 'Invalid Email', email: 'not-an-email', createdAt: '2025-06-01' },
];

/** @type {UserRow[]} */
let usersDb = INITIAL.map((u) => ({ ...u }));

function getAll() {
  return usersDb.map((u) => ({ ...u }));
}

/** @param {string[]} ids */
function deleteMany(ids) {
  const set = new Set(ids);
  usersDb = usersDb.filter((u) => !set.has(u.id));
}

/**
 * @param {string} id
 * @param {Partial<UserRow>} patch
 */
function update(id, patch) {
  const idx = usersDb.findIndex((u) => u.id === id);
  if (idx < 0) {
    const err = new Error(`User ${id} not found`);
    err.status = 404;
    throw err;
  }
  usersDb[idx] = { ...usersDb[idx], ...patch };
  return { ...usersDb[idx] };
}

function reset() {
  usersDb = INITIAL.map((u) => ({ ...u }));
}

module.exports = { getAll, deleteMany, update, reset };

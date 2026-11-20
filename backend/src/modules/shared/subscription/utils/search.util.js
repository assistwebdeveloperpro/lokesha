// Escapes the characters ILIKE treats as wildcards, so a typed % or _ is searched as text
const escapeIlikePattern = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

const toContainsPattern = (value) => `%${escapeIlikePattern(value)}%`;

module.exports = { escapeIlikePattern, toContainsPattern };

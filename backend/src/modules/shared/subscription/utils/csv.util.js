const FORMULA_START = /^[=+\-@\t\r]/;

function toCell(value) {
  if (value === null || value === undefined) return "";

  let text = String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;

  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(columns, rows) {
  const lines = [columns.map(({ header }) => toCell(header)), ...rows.map((row) => columns.map(({ value }) => toCell(value(row))))];
  return `﻿${lines.map((line) => line.join(",")).join("\r\n")}\r\n`;
}

module.exports = { toCsv };

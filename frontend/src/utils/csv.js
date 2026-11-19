const escapeCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[";\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

export const toCsv = (rows) => rows.map((row) => row.map(escapeCell).join(";")).join("\r\n");

export const downloadCsv = (filename, rows) => {
  const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

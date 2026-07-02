// Build a CSV string from rows (array of objects) and trigger a browser download.
// Prepends a UTF-8 BOM so Arabic text renders correctly in Excel.
export function downloadCsv(filename, rows, headers) {
  if (!rows || rows.length === 0) {
    rows = [];
  }
  const cols = headers || (rows[0] ? Object.keys(rows[0]) : []);
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = cols.map((c) => escape(c.label || c.key || c)).join(',');
  const body = rows
    .map((row) => cols.map((c) => escape(row[c.key || c])).join(','))
    .join('\n');
  const bom = String.fromCharCode(0xfeff); // UTF-8 BOM for Excel Arabic support
  const csv = bom + head + '\n' + body;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type ExportRow = Record<string, string | number | boolean | null | undefined>;

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

function toCsv(rows: ExportRow[]) {
  if (!rows.length) return "";
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const encode = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => encode(row[header])).join(","))].join("\r\n");
}

export function downloadCsv(name: string, rows: ExportRow[]) {
  return downloadBlob(`churniq_${name}_${timestamp()}.csv`, new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
}

export function downloadTextReport(name: string, lines: string[]) {
  return downloadBlob(
    `churniq_${name}_${timestamp()}.txt`,
    new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
  );
}

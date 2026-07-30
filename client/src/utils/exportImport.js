export const exportLibraryToJSON = (items, filename = 'mediashelf_library.json') => {
  // Strip mongo database fields to export clean schema-aligned templates
  const cleanItems = items.map(({ _id, createdAt, updatedAt, __v, createdBy, ...rest }) => rest);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanItems, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportLibraryToCSV = (items, filename = 'mediashelf_library.csv') => {
  if (!items || items.length === 0) return;

  const headers = ['type', 'title', 'genre', 'authorOrDirector', 'rating', 'releaseYear', 'status', 'favorite', 'description', 'poster'];
  
  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const stringified = String(str).replace(/"/g, '""');
    return `"${stringified}"`;
  };

  const csvRows = [
    headers.join(','),
    ...items.map(item => [
      escapeCSV(item.type),
      escapeCSV(item.title),
      escapeCSV(item.genre),
      escapeCSV(item.authorOrDirector),
      escapeCSV(item.rating),
      escapeCSV(item.releaseYear),
      escapeCSV(item.status),
      escapeCSV(item.favorite),
      escapeCSV(item.description),
      escapeCSV(item.poster)
    ].join(','))
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
};

export const parseAndValidateJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!Array.isArray(json)) {
          throw new Error("Import data must be a JSON array.");
        }
        resolve(json);
      } catch (err) {
        reject(new Error(`Failed to parse file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("File reading error."));
    reader.readAsText(file);
  });
};

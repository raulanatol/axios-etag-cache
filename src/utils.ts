const byLowerCase = toFind => value => toLowerCase(value) === toFind;
const toLowerCase = value => value.toLowerCase();
const getKeys = headers => Object.keys(headers);

export const getHeaderCaseInsensitive = (headerName, headers = {}) => headers[getKeys(headers).find(byLowerCase(headerName))];

export function stringToEnum(str: string, enumType: any): any {
  let matchingKeys = Object.keys(enumType).filter((key) => enumType[key] === str);
  if (matchingKeys.length === 0) {
    throw('Invalid value "' + str + '" given for enum with values [' +
      Object.keys(enumType).map(key => enumType[key]).join(', ') + ']');
  }
  return enumType[matchingKeys[0]];
}

export function getUrlParamValue(key: string) {
  var query = location.search.substring(1);
  if (!query) {
    return null;
  }
  var params = JSON.parse(`{"${decodeURI(query).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
  return params[key];
}
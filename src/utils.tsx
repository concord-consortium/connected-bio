import { BeachMouse, FieldMouse, Heterozygote } from './models/Organism';

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

export function urlParamToMouse(param: string) {
  switch (param) {
    case 'BeachMouse':
      return BeachMouse;
    case 'FieldMouse':
      return FieldMouse;
    default:
      return Heterozygote;
  }
}

// Converts "a:c,b:C" into "cC"
export function genotypeStringToDisplayString(genotype: string) {
  const regex = /a:(\w+),b:(\w+)/g;
  const match = regex.exec(genotype);
  return match[1] + match[2];
}

/**
 * A pausable timer class.
 * 
 * @param callback: the function to invoke after the specified time
 * @param delay: the delay in milliseconds before the callback is invoked
 * @param loop: if true, restarts the timer when it expires
 */
export class Timer {
  callback: Function;
  delay: number;
  timerId: number;
  start: number;
  remaining: number;
  loop: boolean;

  constructor(callback: Function, delay: number, loop: boolean = false) {
    this.callback = callback;
    this.delay = delay;
    this.remaining = delay;
    this.loop = loop;

    this.executeCallback = this.executeCallback.bind(this);

    this.resume();
  }

  executeCallback() {
    this.callback();
    if (this.loop) {
      this.remaining = this.delay;
      this.resume();
    }
  }

  pause() {
    window.clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
  }

  resume() {
    this.start = Date.now();
    window.clearTimeout(this.timerId);
    this.timerId = window.setTimeout(this.executeCallback, this.remaining);
  }
}

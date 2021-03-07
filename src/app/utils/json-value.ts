import { JSONArray } from './json-array';
import { JSONObject } from './json-object';
import { JSONPrimitive } from './json-primitive';

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

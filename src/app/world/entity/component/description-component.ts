import { JSONObject } from '../../../utils';

export const descriptionComponentKey = 'description';

export interface DescriptionComponentData extends JSONObject {
  name: string;
}

export interface DescriptionComponent extends JSONObject {
  [descriptionComponentKey]: DescriptionComponentData;
}

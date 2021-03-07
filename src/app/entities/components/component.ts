import { ComponentDataUnion } from './component-data-union';

export interface Component {
  [key: string]: ComponentDataUnion;
}

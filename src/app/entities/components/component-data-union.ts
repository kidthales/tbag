import { JSONPrimitive } from '../../utils';

import { ComponentDataArray } from './component-data-array';
import { ComponentDataObject } from './component-data-object';

export type ComponentDataUnion = JSONPrimitive | ComponentDataArray | ComponentDataObject;

import { Component } from '../component';

import { PositionComponentData } from './position-component-data';
import { positionComponentKey } from './position-component-key';

export interface PositionComponent extends Component {
  [positionComponentKey]: PositionComponentData;
}

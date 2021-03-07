import { Component } from '../component';

import { DescriptionComponentData } from './description-component-data';
import { descriptionComponentKey } from './description-component-key';

export interface DescriptionComponent extends Component {
  [descriptionComponentKey]: DescriptionComponentData;
}

import { Component } from '../component';

import { RenderableComponentData } from './renderable-component-data';
import { renderableComponentKey } from './renderable-component-key';

export interface RenderableComponent extends Component {
  [renderableComponentKey]: RenderableComponentData;
}

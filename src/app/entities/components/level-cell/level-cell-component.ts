import { Component } from '../component';

import { LevelCellComponentData } from './level-cell-component-data';
import { levelCellComponentKey } from './level-cell-component-key';

export interface LevelCellComponent extends Component {
  [levelCellComponentKey]: LevelCellComponentData;
}

import { PositionComponent } from './components';
import { EntityStaticData } from './entity-static-data';

export type EntityData = Partial<EntityStaticData> & Partial<PositionComponent>;

import { IntercardinalDirection } from './intercardinal-direction';
import { SecondaryIntercardinalDirectionComponent } from './secondary-intercardinal-direction-component';

export enum SecondaryIntercardinalDirection {
  NorthNortheast = SecondaryIntercardinalDirectionComponent.North + IntercardinalDirection.Northeast,
  EastNortheast = SecondaryIntercardinalDirectionComponent.East + IntercardinalDirection.Northeast,
  EastSoutheast = SecondaryIntercardinalDirectionComponent.East + IntercardinalDirection.Southeast,
  SouthSoutheast = SecondaryIntercardinalDirectionComponent.South + IntercardinalDirection.Southeast,
  SouthSouthwest = SecondaryIntercardinalDirectionComponent.South + IntercardinalDirection.Southwest,
  WestSouthwest = SecondaryIntercardinalDirectionComponent.West + IntercardinalDirection.Southwest,
  WestNorthwest = SecondaryIntercardinalDirectionComponent.West + IntercardinalDirection.Northwest,
  NorthNorthwest = SecondaryIntercardinalDirectionComponent.North + IntercardinalDirection.Northwest
}

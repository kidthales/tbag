import { IntercardinalDirection } from './intercardinal-direction';
import { SecondaryIntercardinalDirectionComponent } from './secondary-intercardinal-direction-component';

export enum SecondaryIntercardinalDirection {
  NorthNorthEast = SecondaryIntercardinalDirectionComponent.North + IntercardinalDirection.NorthEast,
  EastNorthEast = SecondaryIntercardinalDirectionComponent.East + IntercardinalDirection.NorthEast,
  EastSouthEast = SecondaryIntercardinalDirectionComponent.East + IntercardinalDirection.SouthEast,
  SouthSouthEast = SecondaryIntercardinalDirectionComponent.South + IntercardinalDirection.SouthEast,
  SouthSouthWest = SecondaryIntercardinalDirectionComponent.South + IntercardinalDirection.SouthWest,
  WestSouthWest = SecondaryIntercardinalDirectionComponent.West + IntercardinalDirection.SouthWest,
  WestNorthWest = SecondaryIntercardinalDirectionComponent.West + IntercardinalDirection.NorthWest,
  NorthNorthWest = SecondaryIntercardinalDirectionComponent.North + IntercardinalDirection.NorthWest
}

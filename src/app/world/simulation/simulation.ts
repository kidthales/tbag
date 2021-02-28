import { enumValues } from '../../utils';
import { ActionType, ActionUnion, MoveAction, MoveActionDirection, NoopAction } from '../action';
import { Effect } from '../effect';
import { Entity } from '../entity';
import { Level } from '../level';
import { CardinalDirection, IntercardinalDirection } from '../map';
import { MoveRule, NoopRule } from '../rule';
import { Scheduler } from '../scheduler';
import { World } from '../world';

const schedulerSentinel = 'sentinel';

export function sync(world: World, level: Level, rng: Phaser.Math.RandomDataGenerator): void {
  const worldScheduler = world.scheduler;

  if (!level.schedulerState) {
    level.entityManager.forEach(({ id }) => worldScheduler.add(id, true, 1));
    return;
  }

  const oldScheduler = new Scheduler(level.schedulerState);

  if (oldScheduler.time < worldScheduler.time) {
    oldScheduler.add(schedulerSentinel, true, 1);

    run(level, oldScheduler, rng, (id) => id === schedulerSentinel && oldScheduler.time >= worldScheduler.time, true);

    oldScheduler.remove(schedulerSentinel);
  } else if (oldScheduler.time > worldScheduler.time) {
    worldScheduler.add(schedulerSentinel, true, 1);

    do {
      worldScheduler.next();
    } while (worldScheduler.time < oldScheduler.time);

    worldScheduler.remove(schedulerSentinel);
  }

  worldScheduler.load(oldScheduler.state);
}

export function run(
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  pauseCondition: (id: string) => boolean,
  skipEffects = false
): Effect[] {
  const entities = level.entityManager;

  let effects: Effect[] = [];
  let id = scheduler.next();

  while (id && !pauseCondition(id)) {
    if (entities.has(id)) {
      effects = effects.concat(act(entities.get(id), level, scheduler, rng, skipEffects));
    }

    id = scheduler.next();
  }

  return effects;
}

export function validate(
  action: ActionUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): boolean {
  switch (action.type) {
    case ActionType.Noop:
      return NoopRule.validate(action.payload, level, scheduler, rng);
    case ActionType.Move:
      return MoveRule.validate(action.payload, level, scheduler, rng);
    default:
      return false;
  }
}

export function apply(
  action: ActionUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  switch (action.type) {
    case ActionType.Noop:
      return NoopRule.apply(action.payload, level, scheduler, rng, skipEffects);
    case ActionType.Move:
      return MoveRule.apply(action.payload, level, scheduler, rng, skipEffects);
    default:
      return [];
  }
}

function act(
  entity: Entity,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  const moveAction = new MoveAction({ actor: entity, direction: getRandomMoveActionDirection(rng) });

  if (validate(moveAction, level, scheduler, rng)) {
    return apply(moveAction, level, scheduler, rng, skipEffects);
  }

  const noopAction = new NoopAction({ actor: entity, duration: 1 });
  return apply(noopAction, level, scheduler, rng, skipEffects);
}

function getRandomMoveActionDirection(rng: Phaser.Math.RandomDataGenerator): MoveActionDirection {
  return rng.pick([...enumValues(CardinalDirection), ...enumValues(IntercardinalDirection)]);
}

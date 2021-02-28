import { phaser } from './phaser';

phaser().then(() => import(/* webpackChunkName: "app" */ './app').then(({ app }) => app()));

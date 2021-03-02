import { phaser } from './phaser';

// Bootstrap Phaser, then load the application & run it.
phaser().then(() => import(/* webpackChunkName: "app" */ './app').then(({ app }) => app()));

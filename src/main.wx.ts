import { Engine, WxPlatform } from 'lite-game-engine';
import { RacerScene } from './scenes/RacerScene';

const engine = new Engine(new WxPlatform());
engine.setScene(new RacerScene(engine));
engine.start();

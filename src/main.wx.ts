import { ensureWeChatMainCanvas } from './platforms/wechat/RacerWechatMainCanvas';
import { startWeChatRacerGame } from './platforms/wechat/startup';
import { installRacerMenuPresentation } from './racer/RacerMenuPresentation';

ensureWeChatMainCanvas();
installRacerMenuPresentation();
startWeChatRacerGame();

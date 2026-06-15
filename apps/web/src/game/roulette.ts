import { Camera } from './camera';
import { canvasWidth, canvasHeight, initialZoom, Skills, Themes, zoomThreshold } from './data/constants';
import { type StageDef, stages } from './data/maps';
import { FastForwader } from './fastForwader';
import type { GameObject } from './gameObject';
import type { IPhysics } from './IPhysics';
import { Marble } from './marble';
import { Minimap } from './minimap';
import { ParticleManager } from './particleManager';
import { Box2dPhysics } from './physics-box2d';
import { RankRenderer } from './rankRenderer';
import { RouletteRenderer } from './rouletteRenderer';
import { SkillEffect } from './skillEffect';
import type { ColorTheme } from './types/ColorTheme';
import type { MouseEventHandlerName, MouseEventName } from './types/mouseEvents.type';
import type { UIObject } from './UIObject';
import { bound } from './utils/bound.decorator';
import { shuffle } from './utils/utils';

export interface KrrkPlayer {
  id: string;
  name: string;
  color: string;
}

export interface FinishRanking {
  rank: number;
  id: string;
  name: string;
  color: string;
}

export class Roulette extends EventTarget {
  protected _marbles: Marble[] = [];
  protected _playerMap: Map<string, KrrkPlayer> = new Map();

  private _lastTime: number = 0;
  private _elapsed: number = 0;

  private _updateInterval = 10;
  private _timeScale = 1;
  private _speed = 1;

  protected _winners: Marble[] = [];
  private _particleManager = new ParticleManager();
  protected _stage: StageDef | null = null;

  protected _camera: Camera = new Camera();
  protected _renderer: RouletteRenderer;

  private _effects: GameObject[] = [];

  protected _winnerRank = 0;
  protected _totalMarbleCount = 0;
  private _goalDist: number = Infinity;
  protected _isRunning: boolean = false;
  protected _loser: Marble | null = null;

  private _uiObjects: UIObject[] = [];

  private physics!: IPhysics;

  private _isReady: boolean = false;
  protected fastForwarder!: FastForwader;
  protected _theme: ColorTheme = Themes.dark;

  get isReady() {
    return this._isReady;
  }

  protected createRenderer(): RouletteRenderer {
    return new RouletteRenderer();
  }

  protected createFastForwader(): FastForwader {
    return new FastForwader();
  }

  constructor(container: HTMLElement) {
    super();
    this._renderer = this.createRenderer();
    this._renderer.init(container).then(() => {
      this._init().then(() => {
        this._isReady = true;
        this._update();
      });
    });
  }

  public getZoom() {
    return initialZoom * this._camera.zoom;
  }

  private addUiObject(obj: UIObject) {
    this._uiObjects.push(obj);
    if (obj.onWheel) {
      this._renderer.canvas.addEventListener('wheel', obj.onWheel);
    }
    if (obj.onMessage) {
      obj.onMessage((msg) => {
        this.dispatchEvent(new CustomEvent('message', { detail: msg }));
      });
    }
  }

  @bound
  private _update() {
    if (!this._lastTime) this._lastTime = Date.now();
    const currentTime = Date.now();

    this._elapsed += (currentTime - this._lastTime) * this._speed * this.fastForwarder.speed;
    if (this._elapsed > 100) {
      this._elapsed %= 100;
    }
    this._lastTime = currentTime;

    const interval = (this._updateInterval / 1000) * this._timeScale;

    while (this._elapsed >= this._updateInterval) {
      this.physics.step(interval);
      this._updateMarbles(this._updateInterval);
      this._particleManager.update(this._updateInterval);
      this._updateEffects(this._updateInterval);
      this._elapsed -= this._updateInterval;
      this._uiObjects.forEach((obj) => obj.update(this._updateInterval));
    }

    if (this._marbles.length > 1) {
      this._marbles.sort((a, b) => b.y - a.y);
    }

    if (this._stage) {
      this._camera.update({
        marbles: this._marbles,
        stage: this._stage,
        needToZoom: this._goalDist < zoomThreshold,
        targetIndex: this._winners.length > 0 ? this._winnerRank - this._winners.length : 0,
      });
    }

    this._render();
    window.requestAnimationFrame(this._update);
  }

  private _updateMarbles(deltaTime: number) {
    if (!this._stage) return;

    for (let i = 0; i < this._marbles.length; i++) {
      const marble = this._marbles[i];
      marble.update(deltaTime);
      if (marble.skill === Skills.Impact) {
        this._effects.push(new SkillEffect(marble.x, marble.y));
        this.physics.impact(marble.id);
      }
      if (marble.y > this._stage.goalY) {
        this._winners.push(marble);

        if (this._isRunning && this._winners.length === this._winnerRank + 1) {
          // 마지막 구슬(꼴찌)이 골인
          this._loser = marble;
          this._isRunning = false;
          this._particleManager.shot(this._renderer.width, this._renderer.height);

          const rankings: FinishRanking[] = this._winners.map((m, idx) => ({
            rank: idx + 1,
            id: this._playerMap.get(m.name)?.id ?? m.name,
            name: m.name,
            color: m.color,
          }));

          this.dispatchEvent(new CustomEvent('finish', { detail: { rankings } }));
        }

        setTimeout(() => {
          this.physics.removeMarble(marble.id);
        }, 500);
      }
    }

    const targetIndex = this._winnerRank - this._winners.length;
    const topY = this._marbles[targetIndex] ? this._marbles[targetIndex].y : 0;
    this._goalDist = Math.abs(this._stage.zoomY - topY);
    this._timeScale = this._calcTimeScale();

    this._marbles = this._marbles.filter((marble) => marble.y <= (this._stage?.goalY ?? Infinity));
  }

  private _calcTimeScale(): number {
    if (!this._stage) return 1;
    const targetIndex = this._winnerRank - this._winners.length;
    if (this._winners.length < this._winnerRank + 1 && this._goalDist < zoomThreshold) {
      if (
        this._marbles[targetIndex] &&
        this._marbles[targetIndex].y > this._stage.zoomY - zoomThreshold * 1.2 &&
        (this._marbles[targetIndex - 1] || this._marbles[targetIndex + 1])
      ) {
        return Math.max(0.2, this._goalDist / zoomThreshold);
      }
    }
    return 1;
  }

  private _updateEffects(deltaTime: number) {
    this._effects.forEach((effect) => effect.update(deltaTime));
    this._effects = this._effects.filter((effect) => !effect.isDestroy);
  }

  private _render() {
    if (!this._stage) return;
    const renderParams = {
      camera: this._camera,
      stage: this._stage,
      entities: this.physics.getEntities(),
      marbles: this._marbles,
      winners: this._winners,
      particleManager: this._particleManager,
      effects: this._effects,
      winnerRank: this._winnerRank,
      winner: null,
      loser: this._loser,
      size: { x: this._renderer.width, y: this._renderer.height },
      theme: this._theme,
    };
    this._renderer.render(renderParams, this._uiObjects);
  }

  private async _init() {
    this.physics = new Box2dPhysics();
    await this.physics.init();

    this.addUiObject(new RankRenderer());
    this.attachEvent();

    const minimap = new Minimap();
    minimap.onViewportChange((pos) => {
      if (pos) {
        this._camera.setPosition(pos, false);
        this._camera.lock(true);
      } else {
        this._camera.lock(false);
      }
    });
    this.addUiObject(minimap);

    this.fastForwarder = this.createFastForwader();
    this.addUiObject(this.fastForwarder);

    this._stage = stages[0];
    this._loadMap();
  }

  @bound
  private mouseHandler(eventName: MouseEventName, e: MouseEvent) {
    const handlerName = `on${eventName}` as MouseEventHandlerName;

    const sizeFactor = this._renderer.sizeFactor;
    const pos = { x: e.offsetX * sizeFactor, y: e.offsetY * sizeFactor };
    this._uiObjects.forEach((obj) => {
      if (!obj[handlerName]) return;
      const bounds = obj.getBoundingBox();
      if (!bounds) {
        obj[handlerName]({ ...pos, button: e.button });
      } else if (
        bounds &&
        pos.x >= bounds.x &&
        pos.y >= bounds.y &&
        pos.x <= bounds.x + bounds.w &&
        pos.y <= bounds.y + bounds.h
      ) {
        obj[handlerName]({ x: pos.x - bounds.x, y: pos.y - bounds.y, button: e.button });
      } else {
        obj[handlerName](undefined);
      }
    });
  }

  private attachEvent() {
    const canvas = this._renderer.canvas;
    const onPointerRelease = (e: Event) => {
      this.mouseHandler('MouseUp', e as MouseEvent);
      window.removeEventListener('pointerup', onPointerRelease);
      window.removeEventListener('pointercancel', onPointerRelease);
    };

    canvas.addEventListener('pointerdown', (e: Event) => {
      this.mouseHandler('MouseDown', e as MouseEvent);
      window.addEventListener('pointerup', onPointerRelease);
      window.addEventListener('pointercancel', onPointerRelease);
    });

    (['MouseMove', 'DblClick'] as MouseEventName[]).forEach((ev) => {
      canvas.addEventListener(
        ev.toLowerCase().replace('mouse', 'pointer') as keyof HTMLElementEventMap,
        (e) => this.mouseHandler(ev, e as MouseEvent),
      );
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private _loadMap() {
    if (!this._stage) throw new Error('No map has been selected');
    this.physics.createStage(this._stage);
    this._camera.initializePosition();
  }

  public clearMarbles() {
    this.physics.clearMarbles();
    this._loser = null;
    this._winners = [];
    this._marbles = [];
    this._playerMap = new Map();
  }

  public setPlayers(players: KrrkPlayer[], rng: () => number = Math.random) {
    this.reset();

    const total = players.length;
    const orders = shuffle(
      Array(total)
        .fill(0)
        .map((_, i) => i),
      rng,
    );

    players.forEach((player, i) => {
      const order = orders[i];
      this._playerMap.set(player.name, player);
      this._marbles.push(new Marble(this.physics, order, total, player.name, 1, player.color, rng));
    });

    this._totalMarbleCount = total;

    if (total > 0) {
      const cols = Math.min(total, 10);
      const rows = Math.ceil(total / 10);
      const lineDelta = -Math.max(0, Math.ceil(rows - 5));
      const centerX = 10.25 + (cols - 1) * 0.3;
      const centerY = (1 + rows) / 2 + lineDelta;

      const spawnWidth = Math.max((cols - 1) * 0.6, 1);
      const spawnHeight = Math.max(rows - 1, 1);
      const margin = 3;
      const viewW = canvasWidth / initialZoom;
      const viewH = canvasHeight / initialZoom;
      const zoom = Math.max(
        1.5,
        Math.min(Math.min(viewW / (spawnWidth + margin * 2), viewH / (spawnHeight + margin * 2)), 3),
      );

      this._camera.initializePosition({ x: centerX, y: centerY }, zoom);
    }
  }

  public start() {
    this._isRunning = true;
    // 꼴찌(마지막)가 골인할 때 드라마틱 연출 → winnerRank = 마지막 순서
    this._winnerRank = this._totalMarbleCount - 1;
    this._camera.startFollowingMarbles();
    this.physics.start();
    this._marbles.forEach((marble) => (marble.isActive = true));
  }

  private _clearMap() {
    this.physics.clear();
    this._marbles = [];
  }

  public reset() {
    this.clearMarbles();
    this._clearMap();
    this._loadMap();
    this._goalDist = Infinity;
  }

  public setMap(index: number) {
    if (index < 0 || index > stages.length - 1) {
      throw new Error('Incorrect map number');
    }
    this._stage = stages[index];
    this.reset();
    this._camera.initializePosition();
  }

  public setTheme(themeName: keyof typeof Themes) {
    this._theme = Themes[themeName];
  }

  public setSpeed(value: number) {
    if (value <= 0) throw new Error('Speed must be > 0');
    this._speed = value;
  }

  public getMaps() {
    return stages.map((stage, index) => ({ index, title: stage.title }));
  }
}

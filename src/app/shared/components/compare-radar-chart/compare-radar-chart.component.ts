import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { formatPokemonName } from '../../../core/models/pokemon.model';
import type { StatRadarPoint } from '../stat-radar-chart/stat-radar-chart.component';

const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

@Component({
  selector: 'app-compare-radar-chart',
  standalone: true,
  templateUrl: './compare-radar-chart.component.html',
  styleUrl: './compare-radar-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareRadarChartComponent {
  private readonly lang = inject(LanguageService);

  @Input({ required: true }) leftStats!: StatRadarPoint[];
  @Input({ required: true }) rightStats!: StatRadarPoint[];
  @Input() leftColor = '#e53935';
  @Input() rightColor = '#00b8d9';
  @Input() max = 255;

  readonly chartSize = 280;
  readonly center = 140;
  readonly radius = 96;

  get orderedLeft(): StatRadarPoint[] {
    return this.orderStats(this.leftStats);
  }

  get orderedRight(): StatRadarPoint[] {
    return this.orderStats(this.rightStats);
  }

  gridLevels(): number[] {
    return [0.25, 0.5, 0.75, 1];
  }

  gridPolygonPoints(level: number): string {
    return STAT_ORDER.map((_, index) => this.axisPoint(index, level)).join(' ');
  }

  leftPolygon(): string {
    return this.dataPolygon(this.orderedLeft);
  }

  rightPolygon(): string {
    return this.dataPolygon(this.orderedRight);
  }

  axisCoords(index: number, ratio = 1): { x: number; y: number } {
    const angle = this.angleForIndex(index);
    const distance = this.radius * ratio;
    return {
      x: this.center + distance * Math.cos(angle),
      y: this.center + distance * Math.sin(angle),
    };
  }

  labelPosition(index: number): { x: number; y: number } {
    const angle = this.angleForIndex(index);
    const distance = this.radius + 22;
    return {
      x: this.center + distance * Math.cos(angle),
      y: this.center + distance * Math.sin(angle),
    };
  }

  shortLabel(name: string): string {
    this.lang.locale();
    const key = `statShort.${name}` as const;
    const translated = this.lang.t(key);
    return translated !== key ? translated : formatPokemonName(name);
  }

  private dataPolygon(stats: StatRadarPoint[]): string {
    return stats
      .map((stat, index) => {
        const ratio = Math.min(stat.value / this.max, 1);
        return this.axisPoint(index, ratio);
      })
      .join(' ');
  }

  private axisPoint(index: number, ratio: number): string {
    const point = this.axisCoords(index, ratio);
    return `${point.x},${point.y}`;
  }

  private orderStats(stats: StatRadarPoint[]): StatRadarPoint[] {
    return STAT_ORDER.map((name) => {
      const match = stats.find((stat) => stat.name === name);
      return match ?? { name, value: 0 };
    });
  }

  private angleForIndex(index: number): number {
    return (index / STAT_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  }
}

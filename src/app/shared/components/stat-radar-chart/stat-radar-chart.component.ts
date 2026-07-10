import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { formatPokemonName } from '../../../core/models/pokemon.model';

export interface StatRadarPoint {
  name: string;
  value: number;
}

const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

@Component({
  selector: 'app-stat-radar-chart',
  standalone: true,
  templateUrl: './stat-radar-chart.component.html',
  styleUrl: './stat-radar-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatRadarChartComponent {
  @Input({ required: true }) stats!: StatRadarPoint[];
  @Input() max = 255;
  @Input() color = 'var(--jublia-color-primary)';
  @Input() compact = false;

  get chartAriaLabel(): string {
    const summary = this.orderedStats
      .map((stat) => `${this.shortLabel(stat.name)} ${stat.value}`)
      .join(', ');
    return `Base stats radar chart: ${summary}`;
  }

  get chartSize(): number {
    return this.compact ? 200 : 260;
  }

  get center(): number {
    return this.chartSize / 2;
  }

  get radius(): number {
    return this.compact ? 72 : 96;
  }

  get orderedStats(): StatRadarPoint[] {
    return STAT_ORDER.map((name) => {
      const match = this.stats.find((stat) => stat.name === name);
      return match ?? { name, value: 0 };
    });
  }

  gridLevels(): number[] {
    return [0.25, 0.5, 0.75, 1];
  }

  gridPolygonPoints(level: number): string {
    return this.orderedStats
      .map((_, index) => this.axisPoint(index, level))
      .join(' ');
  }

  axisPoint(index: number, ratio = 1): string {
    const point = this.axisCoords(index, ratio);
    return `${point.x},${point.y}`;
  }

  axisCoords(index: number, ratio = 1): { x: number; y: number } {
    const angle = this.angleForIndex(index);
    const distance = this.radius * ratio;
    return {
      x: this.center + distance * Math.cos(angle),
      y: this.center + distance * Math.sin(angle),
    };
  }

  dataPolygon(): string {
    return this.orderedStats
      .map((stat, index) => {
        const ratio = Math.min(stat.value / this.max, 1);
        return this.axisPoint(index, ratio);
      })
      .join(' ');
  }

  labelPosition(index: number): { x: number; y: number } {
    const angle = this.angleForIndex(index);
    const distance = this.radius + (this.compact ? 16 : 22);
    return {
      x: this.center + distance * Math.cos(angle),
      y: this.center + distance * Math.sin(angle),
    };
  }

  shortLabel(name: string): string {
    const labels: Record<string, string> = {
      hp: 'HP',
      attack: 'ATK',
      defense: 'DEF',
      'special-attack': 'SpA',
      'special-defense': 'SpD',
      speed: 'SPD',
    };
    return labels[name] ?? formatPokemonName(name);
  }

  private angleForIndex(index: number): number {
    return (index / this.orderedStats.length) * Math.PI * 2 - Math.PI / 2;
  }
}

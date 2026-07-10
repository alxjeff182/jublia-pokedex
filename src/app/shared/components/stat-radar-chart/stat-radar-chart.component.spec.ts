import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatRadarChartComponent } from './stat-radar-chart.component';

describe('StatRadarChartComponent', () => {
  let fixture: ComponentFixture<StatRadarChartComponent>;
  let component: StatRadarChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatRadarChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatRadarChartComponent);
    component = fixture.componentInstance;
    component.stats = [
      { name: 'hp', value: 45 },
      { name: 'attack', value: 49 },
      { name: 'speed', value: 45 },
    ];
    fixture.detectChanges();
  });

  it('orders stats and builds polygon points', () => {
    expect(component.orderedStats.length).toBe(6);
    expect(component.orderedStats[0].name).toBe('hp');
    expect(component.dataPolygon()).toContain(',');
    expect(component.gridLevels()).toEqual([0.25, 0.5, 0.75, 1]);
  });

  it('uses compact dimensions when enabled', () => {
    component.compact = true;
    expect(component.chartSize).toBe(200);
    expect(component.radius).toBe(72);
  });

  it('maps short stat labels', () => {
    expect(component.shortLabel('special-attack')).toBe('SpA');
    expect(component.shortLabel('custom-stat')).toBe('Custom Stat');
  });

  it('builds accessible chart label from stats', () => {
    expect(component.chartAriaLabel).toContain('Base stats radar chart');
    expect(component.chartAriaLabel).toContain('HP 45');
  });
});

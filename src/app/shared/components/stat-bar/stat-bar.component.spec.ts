import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatBarComponent } from './stat-bar.component';

describe('StatBarComponent', () => {
  let fixture: ComponentFixture<StatBarComponent>;
  let component: StatBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatBarComponent);
    component = fixture.componentInstance;
    component.name = 'special-attack';
    component.value = 128;
    fixture.detectChanges();
  });

  it('formats label and ratio', () => {
    expect(component.label).toBe('Sp. Atk');
    expect(component.ratio).toBeCloseTo(128 / 255, 5);
  });

  it('caps ratio at 1 when value exceeds max', () => {
    component.value = 300;
    expect(component.ratio).toBe(1);
  });

  it('renders compact layout when enabled', () => {
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stat-row.compact')).toBeTruthy();
  });

  it('renders highlight styling when enabled', () => {
    fixture.componentRef.setInput('highlight', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stat-row.highlight')).toBeTruthy();
  });

  it('renders muted compact values', () => {
    fixture.componentRef.setInput('compact', true);
    fixture.componentRef.setInput('mutedValue', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.muted-value')).toBeTruthy();
  });
});

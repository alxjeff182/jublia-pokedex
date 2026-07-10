import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeChipComponent } from './type-chip.component';

describe('TypeChipComponent', () => {
  let fixture: ComponentFixture<TypeChipComponent>;
  let component: TypeChipComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TypeChipComponent);
    component = fixture.componentInstance;
    component.type = 'electric';
    fixture.detectChanges();
  });

  it('renders formatted label and type color', () => {
    expect(component.label).toBe('Electric');
    expect(component.color).toBe('#F8D030');
  });
});

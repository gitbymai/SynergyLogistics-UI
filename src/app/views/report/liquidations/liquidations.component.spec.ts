import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidationsComponent } from './liquidations.component';

describe('LiquidationsComponent', () => {
  let component: LiquidationsComponent;
  let fixture: ComponentFixture<LiquidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiquidationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiquidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

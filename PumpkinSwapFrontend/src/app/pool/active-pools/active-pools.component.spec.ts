import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivePoolsComponent } from './active-pools.component';

describe('ActivePoolsComponent', () => {
  let component: ActivePoolsComponent;
  let fixture: ComponentFixture<ActivePoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivePoolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivePoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

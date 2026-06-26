import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperheroeListComponent } from './superheroe-list.component';

describe('SuperheroeListComponent', () => {
  let component: SuperheroeListComponent;
  let fixture: ComponentFixture<SuperheroeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperheroeListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperheroeListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

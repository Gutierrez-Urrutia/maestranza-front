import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarFormComponent } from './agregar-form.component';

describe('AgregarFormComponent', () => {
  let component: AgregarFormComponent;
  let fixture: ComponentFixture<AgregarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFormComponent } from './editar-form.component';

describe('EditarFormComponent', () => {
  let component: EditarFormComponent;
  let fixture: ComponentFixture<EditarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

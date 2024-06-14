import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-nueva-tarea',
  templateUrl: './nueva-tarea.component.html',
  styleUrls: ['./nueva-tarea.component.scss']
})
export class NuevaTareaComponent implements OnInit {
  formulario: FormGroup;
  isLoading: boolean = false; //pantalla de carga


  //campos de la tarea

  titulo: string = "";
  descripcion: string = "";


  isTituloEmpty: boolean = false;
  requerido: boolean = false;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void { }


  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    // Procesa los datos del formulario
    console.log(this.formulario.value);
  }

  onInputChange(controlName: string): void {
    const control = this.formulario.get(controlName);
    if (control) {
      if (control.invalid && (control.value || control.touched)) {
        control.markAsDirty();
      } else {
        control.markAsPristine();
      }
      if (control.value.length === 0) {
        control.setErrors({ 'required': true });
      }
    }
  }


  validarInput(contenidoInput: string): boolean {

    if (!contenidoInput.trim()) {
      this.requerido = true;
    } else {
      this.requerido = false;
      // Lógica para guardar la tarea
    }

    return this.requerido;

  }


  backPage() {
    this.isLoading = true;
  }


  limpiarCrear() {

  }


  loadData() {

  }

  //abirir y cerrar el mat expander
  desplegarCarDes: boolean = false;

  //Abrir/Cerrar SideNav
  // @ViewChild('sidenav')
  // sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  //Abrir cerrar Sidenav
  close(reason: string) {
    // this.sidenav.close();
    this.sidenavend.close();
  }
}

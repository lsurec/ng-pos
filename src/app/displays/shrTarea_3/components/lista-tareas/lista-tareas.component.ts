import { Component } from '@angular/core';

@Component({
  selector: 'app-lista-tareas',
  templateUrl: './lista-tareas.component.html',
  styleUrls: ['./lista-tareas.component.scss']
})
export class ListaTareasComponent {

  verDetalles: boolean = false;
  verCrear: boolean = false;
  isLoading: boolean = false;
  verError: boolean = false;
  regresar: number = 1;

  verTareas: boolean = true;
  verAsignadas: boolean = false;
  verCreadas: boolean = false;
  verInvitaciones: boolean = false;


  constructor() {
  }

  cargar() {
    this.isLoading = true;
    this.verTareas = false;
    this.verDetalles = false;
    this.verCrear = false;
  }
  detalles() {
    this.verDetalles = true;
    this.isLoading = false;
    this.verTareas = false;
    this.verCrear = false;
  }

  crear() {
    this.verCrear = true;
    this.verDetalles = false;
    this.isLoading = false;
    this.verTareas = false;
  }

  goBack() {

  }

  loadData() {

  }


  tareas() {
    this.verTareas = true;
    this.verAsignadas = false;
    this.verCreadas = false;
    this.verInvitaciones = false;
  }

  creadas() {
    this.verCreadas = true;
    this.verTareas = false;
    this.verAsignadas = false;
    this.verInvitaciones = false;

  }

  asignadas() {
    this.verAsignadas = true;
    this.verTareas = false;
    this.verCreadas = false;
    this.verInvitaciones = false;

  }

  invitaciones() {
    this.verInvitaciones = true;
    this.verTareas = false;
    this.verAsignadas = false;
    this.verCreadas = false;
  }


}

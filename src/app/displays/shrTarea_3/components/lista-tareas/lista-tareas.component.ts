import { Component } from '@angular/core';

@Component({
  selector: 'app-lista-tareas',
  templateUrl: './lista-tareas.component.html',
  styleUrls: ['./lista-tareas.component.scss']
})
export class ListaTareasComponent {

  verTareas: boolean = true;
  verDetalles: boolean = false;
  verCrear: boolean = false;
  verCarga: boolean = false;

  constructor() {
  }

  cargar() {
    this.verCarga = true;
    this.verTareas = false;
    this.verDetalles = false;
    this.verCrear = false;
  }


  tareas() {
    this.verTareas = true;
    this.verCarga = false;
    this.verDetalles = false;
    this.verCrear = false;
  }

  detalles() {
    this.verDetalles = true;
    this.verCarga = false;
    this.verTareas = false;
    this.verCrear = false;
  }

  crear() {
    this.verCrear = true;
    this.verDetalles = false;
    this.verCarga = false;
    this.verTareas = false;
  }


}

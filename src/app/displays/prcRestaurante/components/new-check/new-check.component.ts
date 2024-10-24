import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-check',
  templateUrl: './new-check.component.html',
  styleUrls: ['./new-check.component.scss']
})
export class NewCheckComponent {

  nombre: string = "";

  constructor(
    public dialogRef: MatDialogRef<NewCheckComponent>,
  ) {

  }

  cancelar() {
    this.dialogRef.close();
  }

  agregar() {
    this.dialogRef.close(this.nombre);
  }

  //detectamos la tecla precionada
  @HostListener('document:keydown', ['$event'])
  //Manejo de eventos del declado
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log("Tecla presionada:", event.key);

    //si es enter guardar y validar el pin del mesero
    if (event.key.toLowerCase() === "enter") {
      //evita o bloquea la funcion que tiene por defecto
      event.preventDefault();
      //realiza la funcion que se necesite
      this.agregar();
    }
  }

}

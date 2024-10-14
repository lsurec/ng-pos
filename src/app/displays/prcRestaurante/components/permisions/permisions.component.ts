import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-permisions',
  templateUrl: './permisions.component.html',
  styleUrls: ['./permisions.component.scss']
})
export class PermisionsComponent {

  clave: string = "";
  nombre: string = "";


  constructor(
    public dialogRef: MatDialogRef<PermisionsComponent>,
  ) {
  }


  cancelar() {
    this.clave = "";
    this.nombre = "";
    this.dialogRef.close();
  }

  guardar() {
    this.dialogRef.close(true);
  }

}

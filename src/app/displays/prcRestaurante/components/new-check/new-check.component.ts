import { Component } from '@angular/core';
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

}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';

@Component({
  selector: 'app-cargo-descuento',
  templateUrl: './cargo-descuento.component.html',
  styleUrls: ['./cargo-descuento.component.scss']
})
export class CargoDescuentoComponent {

  isLoading: boolean = false;

  operaciones!: TraInternaInterface[];

  constructor(
    public dialogRef: MatDialogRef<CargoDescuentoComponent>,
    @Inject(MAT_DIALOG_DATA) public transacciones: TraInternaInterface,
  ) {
    this.operaciones = transacciones.operaciones;
    console.log(transacciones);
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}

import { Component, Inject } from '@angular/core';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent {

  producto: ProductoInterface;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public productoSeleccionado: ProductoInterface,
  ) {
    this.producto = productoSeleccionado;
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}

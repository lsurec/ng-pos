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
  cantidad: number = 1;
  bodega!: string;

  bodegas: string[] = [
    "(1) COCINA | Existencia (1000.00)"
  ];

  precio!: string;
  precios: string[] = [
    "Precio Normal"
  ]

  constructor(
    public dialogRef: MatDialogRef<ProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public productoSeleccionado: ProductoInterface,
  ) {
    this.producto = productoSeleccionado;
    console.log(this.producto);
  }


  sumar() {
    this.cantidad++;
  }

  restar() {
    this.cantidad--;
    if (this.cantidad <= 0) {
      this.cantidad = 0;
    }
  }
  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}

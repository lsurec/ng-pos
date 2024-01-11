import { Component, Inject } from '@angular/core';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetalleComponent } from '../detalle/detalle.component';

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

  precioProducto: number = 65.00;
  total: number = 0.00;
  bodegas: string[] = [
    "(1) COCINA | Existencia (1000.00)"
  ];

  precio!: string;
  precios: string[] = [
    "Precio Normal"
  ]

  constructor(
    public dialogRef: MatDialogRef<DetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public productoSeleccionado: ProductoInterface,
  ) {
    this.producto = productoSeleccionado;

    this.total = this.cantidad * this.precioProducto;
  }


  sumar() {
    this.cantidad++;
    let unidades: number = this.cantidad;
    this.total = this.precioProducto * unidades;
  }

  restar() {
    this.cantidad--;
    let unidades: number = this.cantidad;
    this.total = this.precioProducto * unidades;

    if (this.cantidad <= 0) {
      this.cantidad = 0;
    }

  }
  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {

    let producto: ProductoInterface = {
      sku: this.producto.sku,
      nombre: this.producto.nombre,
    }

    this.producto = producto;

    let compra: CompraInterface = {
      producto: this.producto,
      cantidad: this.cantidad,
      precioUnitario: this.precioProducto,
      total: this.total,
    }

    console.log(compra);

    this.dialogRef.close(compra);

  }

}

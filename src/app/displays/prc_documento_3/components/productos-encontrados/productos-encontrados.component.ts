import { Component, Inject } from '@angular/core';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductoComponent } from '../producto/producto.component';

@Component({
  selector: 'app-productos-encontrados',
  templateUrl: './productos-encontrados.component.html',
  styleUrls: ['./productos-encontrados.component.scss']
})
export class ProductosEncontradosComponent {

  productos: ProductoInterface[] = [];
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProductosEncontradosComponent>,
    @Inject(MAT_DIALOG_DATA) public productosEncontrados: ProductoInterface[],
    private _dialog: MatDialog,

  ) {
    this.productos = productosEncontrados;
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}

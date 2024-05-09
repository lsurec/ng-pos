import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImagenProductoInterface, ProductoInterface } from '../../interfaces/producto.interface';

@Component({
  selector: 'app-imagen',
  templateUrl: './imagen.component.html',
  styleUrls: ['./imagen.component.scss']
})
export class ImagenComponent {
  isLoading: boolean = false; //pantalla de carga
  producto?: ProductoInterface;
  imagenes: string[];
  indexImagen = 1;
  constructor(
    //Instancias de los servicios qeu se van  a usar
    public dialogRef: MatDialogRef<ImagenComponent>,
    @Inject(MAT_DIALOG_DATA) public imagenesProducto: ImagenProductoInterface,
  ) {

    this.imagenes = imagenesProducto.imagenesUrl;
    this.urlVisible = this.imagenes[this.indexImagen];
    console.log(this.urlVisible);
    
  }


  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  urlVisible: string = "";

  siguiente() {

    this.indexImagen = this.indexImagen + 1;

    this.urlVisible = this.imagenes[this.indexImagen];
    console.log(this.indexImagen);
  }


  anterior() {
    this.indexImagen = this.indexImagen - 1;

    this.urlVisible = this.imagenes[this.indexImagen];


    console.log(this.indexImagen);
    console.log(this.imagenes[this.indexImagen]);

  }
}

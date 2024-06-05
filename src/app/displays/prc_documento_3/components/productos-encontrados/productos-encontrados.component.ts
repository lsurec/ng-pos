import { Component, Inject } from '@angular/core';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ImagenProductoInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { ProductoService } from '../../services/producto.service';
import { ProductService } from '../../services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { ImagenComponent } from '../imagen/imagen.component';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ObjetoProductoInterface } from '../../interfaces/objeto-producto.interface';

@Component({
  selector: 'app-productos-encontrados',
  templateUrl: './productos-encontrados.component.html',
  styleUrls: ['./productos-encontrados.component.scss'],
  providers: [ProductService]
})
export class ProductosEncontradosComponent {

  productos: ProductoInterface[] = []; //lista de productos encontrados
  isLoading: boolean = false; //pantalla de carga
  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //tokem de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion

  constructor(
    //Instancias de los servicios qeu se van  a usar
    public dialogRef: MatDialogRef<ProductosEncontradosComponent>,
    private _dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public productosEncontrados: ProductoInterface[],
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
  ) {
    //porudtcos disponibles
    this.productos = productosEncontrados;
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  //seleccionar producto
  async setProduct(product: ProductoInterface) {
      //cerrar dialogo
      this.dialogRef.close(product);
   
  }

  async imagen(producto: ProductoInterface) {

    this.isLoading = true;

    //seacrh image in products 
    let resObjProduct: ResApiInterface = await this._productService.getObjetosProducto(
      this.token,
      producto.producto,
      producto.unidad_Medida,
      this.empresa,
    )
    this.isLoading = false;


    //si no feue posible controrar los factores de conversion mostrar error
    if (!resObjProduct.status) {

      //TODO:Translate


      this._notificationsService.openSnackbar("Algo salió mal.");

      return;

    }

    let imagenesObj:ObjetoProductoInterface[] = resObjProduct.response;


    if(imagenesObj.length == 0){
      //TODO:Translate
      this._notificationsService.openSnackbar("No hay imagenes asociadas a este producto.");
      return;
    }
    


    let imagenes:string [] = [];


    imagenesObj.forEach(element => {
      imagenes.push(element.url_Img);
    });


    let imagenesProducto: ImagenProductoInterface = {
      producto: producto,
      imagenesUrl: imagenes,
    }

    this._dialog.open(ImagenComponent, { data: imagenesProducto })
  }
}

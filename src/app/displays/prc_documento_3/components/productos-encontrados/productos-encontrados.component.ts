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
import { FacturaService } from '../../services/factura.service';

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
    public productService: ProductService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    public facturaService: FacturaService,

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
    let resObjProduct: ResApiInterface = await this.productService.getObjetosProducto(
      this.token,
      producto.producto,
      producto.unidad_Medida,
      this.empresa,
    )
    this.isLoading = false;


    //si no feue posible controrar los factores de conversion mostrar error
    if (!resObjProduct.status) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.algoSalioMal'));
      return;
    }

    let imagenesObj: ObjetoProductoInterface[] = resObjProduct.response;


    if (imagenesObj.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinImagenes'));
      return;
    }



    let imagenes: string[] = [];


    imagenesObj.forEach(element => {
      imagenes.push(element.url_Img);
    });


    let imagenesProducto: ImagenProductoInterface = {
      producto: producto,
      imagenesUrl: imagenes,
    }

    this._dialog.open(ImagenComponent, { data: imagenesProducto })
  }

  async filtrarResultados(vermas: number) {

    // const trimmedText = this.facturaService.searchProduct.trim();

    // // Si no se ha presionado ninguna tecla o el texto es igual al anterior
    // // if (trimmedText.length == 0 || trimmedText === this.previousSearchText && vermas == 0 && this.tareasFiltro.length > 0) {
    // //   return;
    // // }

    // // Actualiza el valor anterior con el valor actual

    // if (this.productos.length == 0) {
    //   this.facturaService.rangoIni = 1;
    //   this.facturaService.rangoFin = this.facturaService.intervaloRegistros;
    // }

    // // Realiza la búsqueda
    // //si ver mas es = 1 aumenta los rangos
    // if (vermas == 1) {

    //   this.isLoading = true;

    //   //aumentar los rangos
    //   let resTarea: ResApiInterface = await this.productService.getProduct(
    //     trimmedText, 
    //     "i"
    //     // this.facturaService.rangoIni, this.facturaService.rangoFin,
    //   );

    //   //si algo salio mal
    //   if (!resTarea.status) {

    //     this.isLoading = false;

    //     let verificador = await this._notificationService.openDialogActions(
    //       {
    //         title: this._translate.instant('pos.alertas.salioMal'),
    //         description: this._translate.instant('pos.alertas.error'),
    //         verdadero: this._translate.instant('pos.botones.informe'),
    //         falso: this._translate.instant('pos.botones.aceptar'),
    //       }
    //     );

    //     if (!verificador) return;

    //     this.mostrarError(resTarea);

    //     return;

    //   }

    //   this.isLoading = false;

    //   //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
    //   let tareasMas: TareaInterface[] = resTarea.response;

    //   this.isLoading = false;

    //   // Insertar la lista de tareas en `tareasFiltro`
    //   this.tareasFiltro.push(...tareasMas);

    //   this.rangoIni = this.tareasFiltro.length + 1;
    //   this.rangoFin = this.rangoIni + this.intervaloRegistros;

    // } else {

    //   this.rangoIni = 1;
    //   this.rangoFin = 10;

    //   this.isLoading = true;

    //   //Consumo de api
    //   let resTarea: ResApiInterface = await this._tareaService.getTareasFiltro(
    //     trimmedText, this.rangoIni, this.rangoFin
    //   );

    //   //si algo salio mal
    //   if (!resTarea.status) {

    //     this.isLoading = false;

    //     let verificador = await this._notificationService.openDialogActions(
    //       {
    //         title: this._translate.instant('pos.alertas.salioMal'),
    //         description: this._translate.instant('pos.alertas.error'),
    //         verdadero: this._translate.instant('pos.botones.informe'),
    //         falso: this._translate.instant('pos.botones.aceptar'),
    //       }
    //     );

    //     if (!verificador) return;

    //     this.mostrarError(resTarea);

    //     return;

    //   }


    //   this.isLoading = false;

    //   //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
    //   this.tareasFiltro = resTarea.response;

    //   this.rangoIni += this.intervaloRegistros;
    //   this.rangoFin += this.intervaloRegistros;
    // }

  }
}

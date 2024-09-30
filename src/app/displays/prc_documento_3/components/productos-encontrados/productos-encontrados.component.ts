import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ImagenProductoInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { ProductService } from '../../services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { ImagenComponent } from '../imagen/imagen.component';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ObjetoProductoInterface } from '../../interfaces/objeto-producto.interface';
import { FacturaService } from '../../services/factura.service';
import { EventService } from 'src/app/services/event.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-productos-encontrados',
  templateUrl: './productos-encontrados.component.html',
  styleUrls: ['./productos-encontrados.component.scss'],
  providers: [ProductService]
})
export class ProductosEncontradosComponent {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

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
    private _eventService: EventService,

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

    const apiObjProd = ()=> this.productService.getObjetosProducto(
      this.token,
      producto.producto,
      producto.unidad_Medida,
      this.empresa,
    );

    //seacrh image in products 
    let resObjProduct: ResApiInterface = await ApiService.apiUse(apiObjProd);
    
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

  async filtrarResultados() {
    const trimmedText = this.facturaService.searchProduct.trim();

    // Captura la posición actual del scroll antes de cargar
    const currentScrollPosition = this.scrollContainer.nativeElement.scrollTop;

    this.isLoading = true;

    const apiProduct = ()=> this.productService.getProduct(
      this.token,
      this.user,
      this.estacion,
      trimmedText,
      this.facturaService.rangoIni,
      this.facturaService.rangoFin,
    );

    let resTarea: ResApiInterface = await ApiService.apiUse(apiProduct);

    if (!resTarea.status) {
      this.isLoading = false;

      let verificador = await this._notificationsService.openDialogActions({
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      });

      if (!verificador) return;

      this.mostrarError(resTarea);
      return;
    }

    // Si la respuesta es exitosa, se agregan los nuevos productos
    let productosMas: ProductoInterface[] = resTarea.response;

    // Agregar los nuevos productos a la lista existente
    this.productos.push(...productosMas);

    this.isLoading = false;

    // Ajusta los rangos para la siguiente carga
    this.facturaService.rangoIni = this.productos.length + 1;
    this.facturaService.rangoFin = this.facturaService.rangoIni + this.facturaService.intervaloRegistros;

    // Restaura la posición del scroll después de que los productos se hayan agregado
    setTimeout(() => {
      this.scrollContainer.nativeElement.scrollTop = currentScrollPosition;
    }, 0);
  }

  mostrarError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }


    PreferencesService.error = error;
    this._eventService.verInformeErrorEvent(true);
  }
}

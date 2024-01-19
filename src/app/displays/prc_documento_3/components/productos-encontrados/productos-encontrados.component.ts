import { Component, Inject } from '@angular/core';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { ProductoService } from '../../services/producto.service';
import { ProductService } from '../../services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { UnitarioInterface } from '../../interfaces/unitario.interface';

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
    @Inject(MAT_DIALOG_DATA) public productosEncontrados: ProductoInterface[],
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    private _productoService: ProductoService,
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

    
    this.isLoading = true;
    //buscar bodegas del produxto
    let resBodega = await this._productService.getBodegaProducto(
      this.user,
      this.token,
      this.empresa,
      this.estacion,
      product.producto,
      product.unidad_Medida,
    );


    //si algo salio mal
    if (!resBodega.status) {
      this.isLoading = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
      console.error(resBodega);
      return;
    }

    //bodegas disponibles
    this._productoService.bodegas = resBodega.response;

    //validar que existan bodegas
    if (this._productoService.bodegas.length == 0) {
      this.isLoading = false;
      this._notificationsService.openSnackbar("No hay bodegas asignadas a este producto.");
      return;
    }


    //Si solo hay una bodega
    if (this._productoService.bodegas.length == 1) {
      this._productoService.bodega = this._productoService.bodegas[0];
      let bodega: number = this._productoService.bodega.bodega;

      //buscar precios
      let resPrecio = await this._productService.getPrecios(
        this.user,
        this.token,
        bodega,
        product.producto,
        product.unidad_Medida,
      );


      // /7si algo salio  mal
      if (!resPrecio.status) {
        this.isLoading = false;

        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
        console.error(resPrecio);

        return;
      }

      //precios disponibles
      let precios: PrecioInterface[] = resPrecio.response;

      //obejto precio interno
      precios.forEach(element => {
        this._productoService.precios.push(
          {
            id: element.tipo_Precio,
            precioU: element.precio_Unidad,
            descripcion: element.des_Tipo_Precio,
            precio: true,
            moneda: element.moneda,
          }
        );
      });

      //si no hay precios buscar factor conversion
      if (this._productoService.precios.length == 0) {
        let resfactor = await this._productService.getFactorConversion(
          this.user,
          this.token,
          bodega,
          product.producto,
          product.unidad_Medida,
        );

        //si algo salio mla
        if (!resfactor.status) {

          this.isLoading = false;

          this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
          console.error(resfactor);
          return;
        }


        //factores de conversion disponibles
        let factores: FactorConversionInterface[] = resfactor.response;


        //objeto precio interno
        factores.forEach(element => {
          this._productoService.precios.push(
            {
              id: element.tipo_Precio,
              precioU: element.precio_Unidad,
              descripcion: element.des_Tipo_Precio,
              precio: false,
              moneda: element.moneda,
            }
          );
        });

      }

      //si solo hay una precio disp0onible
      if (this._productoService.precios.length == 1) {

        ///seleccionar precio por defecto

        let precioU: UnitarioInterface = this._productoService.precios[0];

        this._productoService.precio = precioU;
        this._productoService.total = precioU.precioU;
        this._productoService.precioU = precioU.precioU;
        this._productoService.precioText = precioU.precioU.toString();
      }

    }


    this.isLoading = false;

    //cerrar dialogo
    this.dialogRef.close(product);

  }

}

import { Component, Inject } from '@angular/core';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductoComponent } from '../producto/producto.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ProductService } from '../../services/product.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ProductoService } from '../../services/producto.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';

@Component({
  selector: 'app-productos-encontrados',
  templateUrl: './productos-encontrados.component.html',
  styleUrls: ['./productos-encontrados.component.scss'],
  providers: [ProductService]
})
export class ProductosEncontradosComponent {

  productos: ProductoInterface[] = [];
  isLoading: boolean = false;
  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;

  constructor(
    public dialogRef: MatDialogRef<ProductosEncontradosComponent>,
    @Inject(MAT_DIALOG_DATA) public productosEncontrados: ProductoInterface[],
    private _dialog: MatDialog,
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    private _productoService: ProductoService,
  ) {
    this.productos = productosEncontrados;
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

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


    if (!resBodega.status) {
      this.isLoading = false;
      this._notificationsService.showErrorAlert(resBodega);
      return;
    }

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


      if (!resPrecio.status) {
        this.isLoading = false;

        this._notificationsService.showErrorAlert(resPrecio);
        return;
      }

      let precios: PrecioInterface[] = resPrecio.response;

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

        if (!resfactor.status) {

          this.isLoading = false;

          this._notificationsService.showErrorAlert(resfactor);
          return;
        }


        let factores: FactorConversionInterface[] = resfactor.response;


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

      //si no hay precos ni factores

      if (this._productoService.precios.length == 1) {

        let precioU: UnitarioInterface = this._productoService.precios[0];

        this._productoService.precio = precioU;
        this._productoService.total = precioU.precioU;
        this._productoService.precioU = precioU.precioU;
        this._productoService.precioText = precioU.precioU.toString();
      }

    }

    this.isLoading = false;

    console.log(product);
    

    this.dialogRef.close(product);

  }

}

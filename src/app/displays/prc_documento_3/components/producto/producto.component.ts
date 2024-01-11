import { Component, Inject } from '@angular/core';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetalleComponent } from '../detalle/detalle.component';
import { ProductoService } from '../../services/producto.service';
import { ProductService } from '../../services/product.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  providers: [
    ProductService,
  ]
})
export class ProductoComponent {

  isLoading: boolean = false;

  precioProducto: number = 65.00;


  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;



  constructor(
    public dialogRef: MatDialogRef<DetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public producto: ProductoInterface,
    public productoService: ProductoService,
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
  ) {

  }


  async changeBodega() {

    //reiniciar valores 
    this.productoService.total = 0;
    this.productoService.precios = [];
    this.productoService.precio = undefined;
    this.productoService.precioU = 0;
    this.productoService.precioText = "0";

    let bodega: number = this.productoService.bodega!.bodega;


    this.isLoading = true;

    //buscar precios
    let resPrecio = await this._productService.getPrecios(
      this.user,
      this.token,
      bodega,
      this.producto.producto,
      this.producto.unidad_Medida,
    );


    if (!resPrecio.status) {
      this.isLoading = false;

      this._notificationsService.showErrorAlert(resPrecio);
      return;
    }

    let precios: PrecioInterface[] = resPrecio.response;

    precios.forEach(element => {
      this.productoService.precios.push(
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
    if (this.productoService.precios.length == 0) {
      let resfactor = await this._productService.getFactorConversion(
        this.user,
        this.token,
        bodega,
        this.producto.producto,
        this.producto.unidad_Medida,
      );

      if (!resfactor.status) {

        this.isLoading = false;

        this._notificationsService.showErrorAlert(resfactor);
        return;
      }


      let factores: FactorConversionInterface[] = resfactor.response;


      factores.forEach(element => {
        this.productoService.precios.push(
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

    if (this.productoService.precios.length == 1) {

      let precioU: UnitarioInterface = this.productoService.precios[0];

      this.productoService.precio = precioU;
      this.productoService.total = precioU.precioU;
      this.productoService.precioU = precioU.precioU;
      this.productoService.precioText = precioU.precioU.toString();
    }


    this.isLoading = false;

    //TODO: Calcular total

  }


  changePrice() {
    let precioU: UnitarioInterface = this.productoService.precios[0];

    this.productoService.precio = precioU;
    this.productoService.total = precioU.precioU;
    this.productoService.precioU = precioU.precioU;
    this.productoService.precioText = precioU.precioU.toString();

    //TODO:Calcular total
  }

  sumar() {
    // this.cantidad++;
    // let unidades: number = this.cantidad;
    // this.total = this.precioProducto * unidades;
  }

  restar() {
    // this.cantidad--;
    // let unidades: number = this.cantidad;
    // this.total = this.precioProducto * unidades;

    // if (this.cantidad <= 0) {
    //   this.cantidad = 0;
    // }

  }
  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {



    // let compra: CompraInterface = {
    //   producto: this.producto,
    //   cantidad: this.cantidad,
    //   precioUnitario: this.precioProducto,
    //   total: this.total,
    // }

    // console.log(compra);

    // this.dialogRef.close(compra);

  }

}

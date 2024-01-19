import { Component, Inject } from '@angular/core';
import { DetalleComponent } from '../detalle/detalle.component';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { FacturaService } from '../../services/factura.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { ProductoService } from '../../services/producto.service';
import { ProductService } from '../../services/product.service';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';
import { TranslateService } from '@ngx-translate/core';
import { UnitarioInterface } from '../../interfaces/unitario.interface';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  providers: [
    ProductService,
  ]
})
export class ProductoComponent {

  isLoading: boolean = false; //pantalla de carga

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion



  constructor(
    //Servicios que se van a utilizar
    public dialogRef: MatDialogRef<DetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public producto: ProductoInterface,
    public productoService: ProductoService,
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    public facturaService: FacturaService,
    private _translate: TranslateService,
  ) {

  }

  //Calcular totral de la transaccion
  calculateTotal() {
    //SI no hau precio seleccionado no calcular
    if (!this.productoService.precio) {
      this.productoService.total = 0;
      return;
    }

    //convertir cantidad de texto a numerica
    let cantidad = this.convertirTextoANumero(this.productoService.cantidad);

    //Calcular el total (cantidad * precio seleccionado)
    this.productoService.total = cantidad! * this.productoService.precio.precioU;

  }

  //editar precii
  editPrice() {
    //verificar que la cantidad sea numerica
    if (this.convertirTextoANumero(this.productoService.precioText) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //converti precio string a numero
    let precio = this.convertirTextoANumero(this.productoService.precioText);

    //Verificar que elprecio no sea menor al autorizado
    if (precio! < this.productoService.precioU) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noPrecioMenor'));
      return;
    }


    //Agregar precio editado
    this.productoService.precio!.precioU = precio!;

    this.calculateTotal();


  }

  changeCantidad() {
    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    this.calculateTotal();

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

      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
      console.log(resPrecio);
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
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
        console.log(resfactor);
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

    this.calculateTotal();


  }


  changePrice() {
    let precioU: UnitarioInterface = this.productoService.precios[0];

    this.productoService.precio = precioU;
    this.productoService.total = precioU.precioU;
    this.productoService.precioU = precioU.precioU;
    this.productoService.precioText = precioU.precioU.toString();

    this.calculateTotal();

  }


  convertirTextoANumero(texto: string): number | null {
    // Verificar si la cadena es un número
    const esNumero = /^\d+(\.\d+)?$/.test(texto);

    if (esNumero) {
      // Realizar la conversión a número
      return parseFloat(texto);
      // Si quieres convertir a un número entero, puedes usar parseInt(texto) en lugar de parseFloat.
    } else {
      // Retornar null si la cadena no es un número
      return null;
    }
  }

  sumar() {

    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    let cantidad = this.convertirTextoANumero(this.productoService.cantidad);

    cantidad!++;

    this.productoService.cantidad = cantidad!.toString();

    this.calculateTotal();


  }

  restar() {

    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    let cantidad = this.convertirTextoANumero(this.productoService.cantidad);


    cantidad!--;

    if (cantidad! <= 0) {
      cantidad = 0;
    }

    this.productoService.cantidad = cantidad!.toString();

    this.calculateTotal();



  }
  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {
    //Validaciones

    if (this.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadNumerica'));
      return;
    }

    if (this.convertirTextoANumero(this.productoService.cantidad)! <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadMayor'));
      return;
    }

    if (this.facturaService.montos.length > 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.eliminarPagos'));
      return;
    }

    if (!this.productoService.bodega) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarBodega'));
      return;
    }

    if (this.productoService.precios.length > 0 && !this.productoService.precio) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarTipoPrecio'));
      return;
    }

    if (this.productoService.precio!.precioU < this.productoService.precioU) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noPrecioMenor'));
      return;
    }


    if (this.productoService.bodega.existencia == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.existenciaInsuficiente'));
      return;
    }


    if (this.facturaService.traInternas.length > 0) {
      let monedaDoc = 0;
      let monedaTra = 0;

      let firstTra: TraInternaInterface = this.facturaService.traInternas[0];

      monedaDoc = firstTra.precio!.moneda;
      monedaTra = this.productoService.precio!.moneda;


      if (monedaDoc != monedaTra) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.monedaDistinta'));
        return;
      }

    }


    this.facturaService.addTransaction(
      {
        isChecked: false,
        bodega: this.productoService.bodega,
        producto: this.producto,
        precio: this.productoService.precio!,
        cantidad: this.convertirTextoANumero(this.productoService.cantidad)!,
        total: this.productoService.total,
        cargo: 0,
        descuento: 0,
        operaciones: [],
      }
    );

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionAgregada'));

    this.dialogRef.close();

  }

}

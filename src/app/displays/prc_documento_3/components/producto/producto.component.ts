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
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

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
    let cantidad = UtilitiesService.convertirTextoANumero(this.productoService.cantidad);

    //Calcular el total (cantidad * precio seleccionado)
    this.productoService.total = cantidad! * this.productoService.precio.precioU;

  }

  //editar precii
  editPrice() {
    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.precioText) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //converti precio string a numero
    let precio = UtilitiesService.convertirTextoANumero(this.productoService.precioText);

    //Verificar que elprecio no sea menor al autorizado
    if (precio! < this.productoService.precioU) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noPrecioMenor'));
      return;
    }


    //Agregar precio editado
    this.productoService.precio!.precioU = precio!;

    //Calcular toral de la transacciom
    this.calculateTotal();


  }

  //Cambio en cantidad
  changeCantidad() {

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //calcular total de la trnsaccion
    this.calculateTotal();

  }

  //cambio de bodega
  async changeBodega() {

    //reiniciar valores 
    this.productoService.total = 0; //total de la transaccion
    this.productoService.precios = []; //precios disponibles para la bodega
    this.productoService.precio = undefined; //precio seleccionado
    this.productoService.precioU = 0; //precio unitario
    this.productoService.precioText = "0"; //precio unitario editable

    let bodega: number = this.productoService.bodega!.bodega; //bodega seleccionada


    this.isLoading = true;

    //buscar precios
    let resPrecio = await this._productService.getPrecios(
      this.user,
      this.token,
      bodega,
      this.producto.producto,
      this.producto.unidad_Medida,
    );

    //si algo salió mal
    if (!resPrecio.status) {
      this.isLoading = false;

      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
      console.log(resPrecio);
      return;
    }

    //precios disponibles para una bodega
    let precios: PrecioInterface[] = resPrecio.response;

    //precios a objto interno
    precios.forEach(element => {
      this.productoService.precios.push(
        {
          id: element.tipo_Precio,
          precioU: element.precio_Unidad,
          descripcion: element.des_Tipo_Precio,
          precio: true,
          moneda: element.moneda,
          orden: element.tipo_Precio_Orden,
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

      //si algo salio mal
      if (!resfactor.status) {

        this.isLoading = false;
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.error'));
        console.log(resfactor);
        return;
      }


      //presentaciones disponibles
      let factores: FactorConversionInterface[] = resfactor.response;


      //presentaciones a precio interno
      factores.forEach(element => {
        this.productoService.precios.push(
          {
            id: element.tipo_Precio,
            precioU: element.precio_Unidad,
            descripcion: element.des_Tipo_Precio,
            precio: false,
            moneda: element.moneda,
            orden: element.tipo_Precio_Orden,
          }
        );
      });

    }
    if (this.productoService.precios.length == 1) {

      let precioU: UnitarioInterface = this.productoService.precios[0];

      this.productoService.precio = precioU;
      this.productoService.total = precioU.precioU;
      this.productoService.precioU = precioU.precioU;
      this.productoService.precioText = precioU.precioU.toString();

    } else if (this.productoService.precios.length > 1) {
      for (let i = 0; i < this.productoService.precios.length; i++) {
        const element = this.productoService.precios[i];
        if (element.orden) {
          this.productoService.precio = element;
          this.productoService.total = element.precioU;
          this.productoService.precioU = element.precioU;
          this.productoService.precioText = element.precioU.toString();

        }
        break;

      }

    }


    this.isLoading = false;

    //calcular totales
    this.calculateTotal();

  }


  //cambio de precio selecciondo
  changePrice() {


    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //asignar precio seleccionado
    this.productoService.precioU = this.productoService.precio!.precioU;
    this.productoService.precioText = this.productoService.precioU.toString();

    //calcular totales
    this.calculateTotal();

  }


  // /7aumenta en uno la cantidad
  sumar() {

    //verifica que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //canitdad en numero
    let cantidad = UtilitiesService.convertirTextoANumero(this.productoService.cantidad);

    //aumentar cantidad
    cantidad!++;

    //nueva cantidad
    this.productoService.cantidad = cantidad!.toString();

    //actualiza el total
    this.calculateTotal();


  }

  //disminuye en 1 la cantidad
  restar() {

    //verifica que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //cantidad numerica
    let cantidad = UtilitiesService.convertirTextoANumero(this.productoService.cantidad);


    //disminuir cantidad en 1
    cantidad!--;

    //si es menor o igual a cero, volver a 1 y mostrar
    if (cantidad! <= 0) {
      cantidad = 0;
    }

    //guarda la nueva cantidad
    this.productoService.cantidad = cantidad!.toString();

    //actualizar el total de la transaccion
    this.calculateTotal();

  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }



  //guardar transaccion
  async enviar() {
    //Validaciones

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadNumerica'));
      return;
    }

    //verificar que la cantidad sea mayor a 0
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad)! <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadMayor'));
      return;
    }

    //Verificar que no hyaa formas de pago previamente asignadas al documento
    if (this.facturaService.montos.length > 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.eliminarPagos'));
      return;
    }

    //Verificar que haya seleccionada una bodega
    if (!this.productoService.bodega) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarBodega'));
      return;
    }

    //verificar que haya precios disponibles y seleccioandos
    if (this.productoService.precios.length > 0 && !this.productoService.precio) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarTipoPrecio'));
      return;
    }

    //verificar que el orecio unitario sea el correcto
    if (this.productoService.precio!.precioU < this.productoService.precioU) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noPrecioMenor'));
      return;
    }

    // /7verificar que haya existencvias para el producto
    if (this.productoService.bodega.existencia == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.existenciaInsuficiente'));
      return;
    }


    //si todo ha salido bien, agregamos el producto al documento
    //Buscar la moneda, v
    if (this.facturaService.traInternas.length > 0) {
      let monedaDoc = 0;
      let monedaTra = 0;

      let firstTra: TraInternaInterface = this.facturaService.traInternas[0];

      monedaDoc = firstTra.precio!.moneda;
      monedaTra = this.productoService.precio!.moneda;

      //verificar que todas las transacciones tengan la mmisma moneda
      if (monedaDoc != monedaTra) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.monedaDistinta'));
        return;
      }

    }


    let precioDias: number = 0;

    if (this.facturaService.valueParametro(351)) {

  
      let strFechaIni: string = this.facturaService.formatstrDateForPriceU(this.facturaService.fechaIni!);
      let strFechaFin: string = this.facturaService.formatstrDateForPriceU(this.facturaService.fechaFin!);


      this.isLoading = true;

      let res: ResApiInterface = await this._productService.getFormulaPrecioU(
        this.token,
        strFechaIni,
        strFechaFin,
        this.productoService.total.toString(),
      );

      this.isLoading = false;


      if (!res.status) {
        this._notificationsService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

        console.error(res);

        return;
      }

      precioDias = res.response.data;

    }


    if (this.productoService.indexEdit == -1) {


      // /7agregar transaccion
      this.facturaService.addTransaction(
        {
          precioCantidad: this.facturaService.valueParametro(351) ? this.productoService.total : null,
          precioDia: this.facturaService.valueParametro(351) ? precioDias : null,
          isChecked: false,
          bodega: this.productoService.bodega,
          producto: this.producto,
          precio: this.productoService.precio!,
          cantidad: UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
          total: this.facturaService.valueParametro(351) ? precioDias : this.productoService.total,
          cargo: 0,
          descuento: 0,
          operaciones: [],
        }
      );

      //Transacion agregada
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionAgregada'));

    } else {
      // /7agregar transaccion
      this.facturaService.traInternas[this.productoService.indexEdit] = {
        precioCantidad: this.facturaService.valueParametro(351) ? this.productoService.total : null,
        precioDia: this.facturaService.valueParametro(351) ? precioDias : null,
        isChecked: false,
        bodega: this.productoService.bodega,
        producto: this.producto,
        precio: this.productoService.precio!,
        cantidad: UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
        total: this.facturaService.valueParametro(351) ? precioDias : this.productoService.total,
        cargo: 0,
        descuento: 0,
        operaciones: [],
      }

      this.facturaService.calculateTotales();

      //Transacion agregada
      //TODO:Translate
      this._notificationsService.openSnackbar("Transaccion modificada");

    }


    this.dialogRef.close();

  }

}

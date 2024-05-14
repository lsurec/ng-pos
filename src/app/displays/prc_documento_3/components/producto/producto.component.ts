import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DetalleComponent } from '../detalle/detalle.component';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { FacturaService } from '../../services/factura.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ImagenProductoInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { ProductoService } from '../../services/producto.service';
import { ProductService } from '../../services/product.service';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';
import { TranslateService } from '@ngx-translate/core';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ValidateProductInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/validate-product.interface';
import { DataUserService } from '../../services/data-user.service';
import { ImagenComponent } from '../imagen/imagen.component';
import { ObjetoProductoInterface } from '../../interfaces/objeto-producto.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  providers: [
    ProductService,
  ]
})
export class ProductoComponent implements OnInit, AfterViewInit {

  //para seleciconar el valor del texto del input
  @ViewChild('cantidadInput') myInput?: ElementRef;
  @ViewChild('miInput') inputCantidad: ElementRef | undefined;

  isLoading: boolean = false; //pantalla de carga

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion



  constructor(
    //Servicios que se van a utilizar
    private _dialog: MatDialog,
    public dialogRef: MatDialogRef<DetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public producto: ProductoInterface,
    public productoService: ProductoService,
    private _productService: ProductService,
    private _notificationsService: NotificationsService,
    public facturaService: FacturaService,
    private _translate: TranslateService,
    private _dataUserService: DataUserService,
    private _router: Router,
  ) {

  }
  ngOnInit(): void {
    // this.seleccionarTexto();
    // console.log("init");

  }

  ngAfterViewInit(): void {
    this.inputCantidad!.nativeElement.select();
  }

  seleccionarTexto() {
    const inputEl = this.inputCantidad!.nativeElement;
    inputEl.focus(); // Asegúrate de que el input tenga el foco
    inputEl.setSelectionRange(0, inputEl.value.length); // Selecciona todo el texto
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
    //usar pa valida

    this.isLoading = true;


    let resDisponibiladProducto: ResApiInterface = await this._productService.getValidateProducts(
      this.user,
      this.facturaService.serie!.serie_Documento,
      this.facturaService.tipoDocumento!,
      this.estacion,
      this.empresa,
      this.productoService.bodega.bodega,
      this.facturaService.resolveTipoTransaccion(this.producto.tipo_Producto),
      this.producto.unidad_Medida,
      this.producto.producto,
      UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
      8, //TODO:Parametrizar
      this.productoService.precio!.moneda,
      this.productoService.precio!.id,
      this.token,

    );


    if (!resDisponibiladProducto.status) {
      //TODO:Translate
      this.isLoading = false;

      this.showError(resDisponibiladProducto, "No se pudo verificar la disponibilidad del producto");

      // this._notificationsService.openSnackbar("No se pudo verificar la disponibilidad del producto");
      console.error(resDisponibiladProducto);
      return;
    }

    this.isLoading = false;



    let mensajes: string[] = resDisponibiladProducto.response;


    //si hay mensjaes hay inconvenientes
    if (mensajes.length > 0) {

      let validaciones: ValidateProductInterface[] = [
        {
          bodega: `${this.productoService.bodega.nombre} (${this.productoService.bodega!.bodega})`,
          mensajes: mensajes,
          productoDesc: this.producto.des_Producto,
          serie: `${this.facturaService.serie!.descripcion} (${this.facturaService.serie!.serie_Documento})`,
          sku: this.producto.producto_Id,
          tipoDoc: `${this._dataUserService.nameDisplay} (${this.facturaService.tipoDocumento!})`,
        }
      ]

      this.dialogRef.close(
        validaciones
      );


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



      let res: ResApiInterface = await this._productService.getFormulaPrecioU(
        this.token,
        strFechaIni,
        strFechaFin,
        this.productoService.total.toString(),
      );



      if (!res.status) {
        this.isLoading = false;

        this._notificationsService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

        console.error(res);

        return;
      }


      precioDias = res.response.data;

    }

    this.isLoading = false;



    if (this.productoService.indexEdit == -1) {


      // /7agregar transaccion
      this.facturaService.addTransaction(
        {
          consecutivo: 0,
          estadoTra: 1,
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
        consecutivo: this.facturaService.traInternas[this.productoService.indexEdit].consecutivo,
        estadoTra: 1,
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


    this.dialogRef.close([]);

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

    let imagenesObj: ObjetoProductoInterface[] = resObjProduct.response;


    if (imagenesObj.length == 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("No hay imagenes asociadas a este producto.");
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

  selectText() {
    const inputElement = this.myInput!.nativeElement;
    inputElement.focus();
    inputElement.setSelectionRange(0, inputElement.value.length);
  }

  //mostrar error
  //TODO: Dialogo de error
  async showError(res: ResApiInterface, mensaje: string) {

    //Dialogo de confirmacion
    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: mensaje,
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //cancelar
    if (!verificador) return;

    //Objeto error
    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //guardar error
    PreferencesService.error = error;

    //mostrar informe de error en pantalla
    // this._router.navigate([RouteNamesService.ERROR]);

  }
}

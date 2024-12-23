import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
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
import { TypeErrorInterface } from 'src/app/interfaces/type-error.interface';
import { PrecioDiaInterface } from '../../interfaces/precio-dia.interface';
import { CurrencyPipe } from '@angular/common';
import { CurrencyFormatPipe } from 'src/app/pipes/currecy-format/currency-format.pipe';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  providers: [
    ProductService,
    CurrencyPipe,
    CurrencyFormatPipe,
  ]
})
export class ProductoComponent implements OnInit, AfterViewInit {

  //para seleciconar el valor del texto del input
  @ViewChild('cantidadInput') cantidadInput?: ElementRef;

  isLoading: boolean = false; //pantalla de carga
  habilitarImagen: boolean = true; //desabilitar temporalmente el boton de imagenes de prducti
  timer: any; //temporizador
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
  ) {

  }
  ngOnInit(): void {
    this.calculateTotal();
    this.deshabilitarImagenTemp();
  }

  ngAfterViewInit(): void {

  }


  deshabilitarImagenTemp() {
    this.timer = setTimeout(() => {
      this.habilitarImagen = false;
    }, 250);
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
    this.productoService.total = parseFloat((cantidad! * this.productoService.precio.precioU).toFixed(2));

    

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


    const apiPrecio = ()=> this._productService.getPrecios(
      this.user,
      this.token,
      bodega,
      this.producto.producto,
      this.producto.unidad_Medida,
      this.facturaService.cuenta?.cuenta_Correntista ?? 0,
      this.facturaService.cuenta?.cuenta_Cta ?? "0",
    );

    //buscar precios
    let resPrecio = await ApiService.apiUse(apiPrecio) ;

    //si algo salió mal
    if (!resPrecio.status) {
      this.isLoading = false;

      let error: TypeErrorInterface = {
        error: resPrecio,
        type: 1,
      }
      this.dialogRef.close(error);
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
      
      const apiFactor = ()=> this._productService.getFactorConversion(
        this.user,
        this.token,
        bodega,
        this.producto.producto,
        this.producto.unidad_Medida,
      );
      
      let resfactor = await ApiService.apiUse(apiFactor);

      //si algo salio mal
      if (!resfactor.status) {

        this.isLoading = false;

        let error: TypeErrorInterface = {
          error: resfactor,
          type: 1,
        }
        this.dialogRef.close(error);
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


  addLeadingZero(number: number): string {
    return number.toString().padStart(2, '0');
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

    if (!this.productoService.bodega!.posee_Componente) {
      this.isLoading = true;

      const apiValidateProd = ()=> this._productService.getValidateProduct(
        this.user,
        this.facturaService.serie!.serie_Documento,
        this.facturaService.tipoDocumento!,
        this.estacion,
        this.empresa,
        this.productoService.bodega!.bodega,
        this.facturaService.resolveTipoTransaccion(this.producto.tipo_Producto),
        this.producto.unidad_Medida,
        this.producto.producto,
        UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
        8, //TODO:Parametrizar
        this.productoService.precio!.moneda,
        this.productoService.precio!.id,
        this.token,

      );

      let resDisponibiladProducto: ResApiInterface = await ApiService.apiUse(apiValidateProd) ;

      if (!resDisponibiladProducto.status) {
        this.isLoading = false;
        let error: TypeErrorInterface = {
          error: resDisponibiladProducto,
          type: 1,
        }
        this.dialogRef.close(error);

        return;
      }

      this.isLoading = false;

      let mensajes: string[] = resDisponibiladProducto.response;

      //si hay mensjaes hay inconvenientes
      if (mensajes.length > 0) {

        this.isLoading = false;

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

        let error: TypeErrorInterface = {
          error: validaciones,
          type: 2,
        }
        this.dialogRef.close(error);

        return;
      }
    }



    //si todo ha salido bien, agregamos el producto al documento
    //Buscar la moneda, v
    if (this.facturaService.traInternas.length > 0) {
      this.isLoading = false;

      let monedaDoc = 0;
      let monedaTra = 0;

      let firstTra: TraInternaInterface = this.facturaService.traInternas[0];

      monedaDoc = firstTra.precio!.moneda;
      monedaTra = this.productoService.precio!.moneda;

      //verificar que todas las transacciones tengan la mmisma moneda
      if (monedaDoc != monedaTra) {
        this.isLoading = false;
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.monedaDistinta'));
        return;
      }

    }


    let precioDias: number = 0;
    let cantidadDias: number = 0;


    //Si el docuemnto tiene fecha inicio y fecha fin, parametro 44, calcular el precio por dias
    //si el producto es servicio no se hace el calculo
    if (this.facturaService.valueParametro(44) && this.producto.tipo_Producto != 2) {


      // let strFechaIni: string = this.facturaService.formatstrDateForPriceU(this.facturaService.fechaIni!);


      if (UtilitiesService.majorOrEqualDateWithoutSeconds(this.facturaService.fechaFin!, this.facturaService.fechaIni!)) {
        
       
        let startDate = this.addLeadingZero(this.facturaService.fechaIni!.getDate());
        let startMont = this.addLeadingZero(this.facturaService.fechaIni!.getMonth() + 1);
        let endDate = this.addLeadingZero(this.facturaService.fechaFin!.getDate());
        let endMont = this.addLeadingZero(this.facturaService.fechaFin!.getMonth() + 1);

        let dateStart: string = `${this.facturaService.fechaIni!.getFullYear()}${startMont}${startDate} ${this.addLeadingZero(this.facturaService.fechaIni!.getHours())}:${this.addLeadingZero(this.facturaService.fechaIni!.getMinutes())}:${this.addLeadingZero(this.facturaService.fechaIni!.getSeconds())}`;
        let dateEnd: string = `${this.facturaService.fechaFin!.getFullYear()}${endMont}${endDate} ${this.addLeadingZero(this.facturaService.fechaFin!.getHours())}:${this.addLeadingZero(this.facturaService.fechaFin!.getMinutes())}:${this.addLeadingZero(this.facturaService.fechaFin!.getSeconds())}`;


        const apiPrecioDia = ()=> this._productService.getFormulaPrecioU(
          this.token,
          dateStart,
          dateEnd,
          this.productoService.total.toString(),
        );

        let res: ResApiInterface = await ApiService.apiUse(apiPrecioDia);

        if (!res.status) {
          this.isLoading = false;


          let error: TypeErrorInterface = {
            error: res,
            type: 1,
          }
          this.dialogRef.close(error);

          return;
        }



        let preciosDia: PrecioDiaInterface[] = res.response;

        if (preciosDia.length == 0) {
          this.isLoading = false;


          res.response = 'No fue posible obtner los valores calculados para el precio dia'
          let error: TypeErrorInterface = {
            error: res,
            type: 1,
          }
          this.dialogRef.close(error);

          return;

        }

        precioDias = preciosDia[0].monto_Calculado;
        cantidadDias = preciosDia[0].catidad_Dia;
      } else {
        this.isLoading = false;

        precioDias = this.productoService.total;
        cantidadDias = 1;
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.precioDiasNoCalculado'));
      }
    }

    this.isLoading = false;



    if (this.productoService.indexEdit == -1) {


      // /7agregar transaccion
      this.facturaService.addTransaction(
        {
          consecutivo: 0,
          estadoTra: 1,
          precioCantidad: this.facturaService.valueParametro(44) && this.producto.tipo_Producto != 2? this.productoService.total : null,
          precioDia: this.facturaService.valueParametro(44)  && this.producto.tipo_Producto != 2   ? precioDias : null,
          isChecked: false,
          bodega: this.productoService.bodega,
          producto: this.producto,
          precio: this.productoService.precio!,
          cantidad: UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
          cantidadDias: this.facturaService.valueParametro(44)  && this.producto.tipo_Producto != 2 ? cantidadDias : 0,
          total: this.facturaService.valueParametro(44)  && this.producto.tipo_Producto != 2 ? precioDias : this.productoService.total,
          cargo: 0,
          descuento: 0,
          operaciones: [],
        }
      );

      this.productoService.cantidad = "1";
      //Transacion agregada
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionAgregada'));

    } else {
      // /7agregar transaccion
      this.facturaService.traInternas[this.productoService.indexEdit] = {
        consecutivo: this.facturaService.traInternas[this.productoService.indexEdit].consecutivo,
        estadoTra: 1,
        precioCantidad: this.facturaService.valueParametro(44)   && this.producto.tipo_Producto != 2? this.productoService.total : null,
        precioDia: this.facturaService.valueParametro(44)  && this.producto.tipo_Producto != 2 ? precioDias : null,
        isChecked: false,
        bodega: this.productoService.bodega,
        producto: this.producto,
        precio: this.productoService.precio!,
        cantidad: UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
        cantidadDias: this.facturaService.valueParametro(44)   && this.producto.tipo_Producto != 2? cantidadDias : 0,
        total: this.facturaService.valueParametro(44)  && this.producto.tipo_Producto != 2 ? precioDias : this.productoService.total,
        cargo: 0,
        descuento: 0,
        operaciones: [],
      }

      this.facturaService.calculateTotales();

      //Transacion agregada
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.traModificada'));
    }

    this.isLoading = false;

    this.dialogRef.close([]);

  }


  async imagen(producto: ProductoInterface) {

    this.isLoading = true;

    const apiObjProd = ()=> this._productService.getObjetosProducto(
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
      let error: TypeErrorInterface = {
        error: resObjProduct,
        type: 2,
      }
      this.dialogRef.close(error);

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


    //Usando la funcion que corrige las imagenes
    // imagenesObj.forEach(element => {
    //   imagenes.push(this.convertirUrlGoogleDrive(element.url_Img));
    // });


    let imagenesProducto: ImagenProductoInterface = {
      producto: producto,
      imagenesUrl: imagenes,
    }

    this._dialog.open(ImagenComponent, { data: imagenesProducto })
  }

  selectText() {
    const inputElement = this.cantidadInput!.nativeElement;
    inputElement.focus();
    inputElement.setSelectionRange(0, inputElement.value.length);
  }

  //detectamos la tecla precionada
  @HostListener('document:keydown', ['$event'])
  //Manejo de eventos del declado
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log("Tecla presionada:", event.key);

    // Debe dirigirse a imprimir cuando:
    //la fecha presionada sea enter,
    if (event.key.toLowerCase() === "enter") {
      //evita o bloquea la funcion que tiene por defecto
      event.preventDefault();
      this.facturaService.tabDetalle = false;
      //realiza la funcion que se necesite
      //Agregar transaccion
      this.enviar();


      setTimeout(() => {
        this.facturaService.tabDetalle = true;
      }, 0);
    }
  }

  convertirUrlGoogleDrive(url: string): string {
    // Extraer el identificador único del archivo desde la URL
    const regex = /\/d\/([^/]+)\//;
    const match = url.match(regex);
    if (!match) {
      throw new Error("URL de Google Drive no válida");
    }
    const identificador = match[1];

    // Crear la URL visible en HTML
    const urlVisible = `https://drive.google.com/uc?id=${identificador}`;
    return urlVisible;
  }

}

import { ClienteInterface } from '../../interfaces/cliente.interface';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { components } from 'src/app/providers/componentes.provider';
import { CuentaService } from '../../services/cuenta.service';
import { DataUserService } from '../../services/data-user.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PagoService } from '../../services/pago.service';
import { ParametroService } from '../../services/parametro.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { SerieService } from '../../services/serie.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { TranslateService } from '@ngx-translate/core';
import { ReferenciaService } from '../../services/referencia.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { OriginDocInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/origin-doc.interface';
import { ProductService } from '../../services/product.service';
import { ProductoInterface } from '../../interfaces/producto.interface';
import { BodegaProductoInterface } from '../../interfaces/bodega-produto.interface';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss'],
  providers: [
    SerieService,
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
    ReferenciaService,
    ProductService,
  ]
})
export class FacturaComponent implements OnInit {

  readonly regresar: number = 1; //id de la pnatalla
  cuenta?: ClienteInterface; //cuenta que se va a editar 
  vistaFactura: boolean = true; //mostrar mmodulo (tabs)
  nuevoCliente: boolean = false;  //mostrar pantalla para crear cuenta correntista
  actualizarCliente: boolean = false; //mostrar pantalla para actualizar cunata correntista
  vistaResumen: boolean = false;  //ver confirmacion del documento
  vistaHistorial: boolean = false;  //ver historial de docuemmntos recientes
  vistaInforme: boolean = false; //ver informe de errores

  user: string = PreferencesService.user; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento?: number = this.facturaService.tipoDocumento; //tipo docuemnto seleccionado
  nombreDocumento: string = this.facturaService.documentoName; //Descripcion del tipo de documento

  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  tabDocummento: boolean = true; //contorlador para la pestaña documento
  tabDetalle: boolean = false;  //controlador para la pestaña de detalle
  tabPago: boolean = false; //Contorlador para la pestaña de pago




  constructor(
    //Instancia de los servicios que se van a utilizar
    private _notificationService: NotificationsService,
    private _eventService: EventService,
    public dataUserService: DataUserService,
    public facturaService: FacturaService,
    private _serieService: SerieService,
    private _cuentaService: CuentaService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
    private _translate: TranslateService,
    private _referenciaService: ReferenciaService,
    private _calendar: NgbCalendar,
    public globalConvertService: GlobalConvertService,
    private _productService: ProductService,

  ) {

    //sucripcion a eventos desde componentes hijo

    //Ver pantalla crear cuenta correntista
    this._eventService.verCrear$.subscribe((eventData) => {
      this.verNuevoCliente();
    });

    //ver pantalla actualizar cuenta correntista
    this._eventService.verActualizar$.subscribe((eventData) => {
      this.cuenta = eventData;
      this.verActualizarCliente();
    });

    //ver modulo factura
    this._eventService.verDocumento$.subscribe((eventData) => {
      this.verDocumento();
    });

    //ver modulo factura
    this._eventService.verResumen$.subscribe((eventData) => {
      this.verDocumento();
    });

    //Ver pantalla de hisrorial de documentos
    this._eventService.verHistorial$.subscribe((eventData) => {
      this.verHistorial();
    });

    //Ver pantalla de informe de errores
    this._eventService.verInformeError$.subscribe((eventData) => {
      this.verInformeError();
    });

  }


  ngOnInit(): void {

    //cargar datos necearios al inicio de la aplicacion
    this.loadData();


    // if (!this.globalConvertService.editDoc) {

    //   this.loadData();
    //   return;
    // }



  }

  //mostrar pestaña doccumento
  showDocumento() {
    this.tabDocummento = true;
    this.tabDetalle = false;
    this.tabPago = false;
  }

  //mostrar pestaña detalle
  showDetalle() {
    this.tabDocummento = false;
    this.tabDetalle = true;
    this.tabPago = false;
  }

  //mostrar pestaña pagos
  showPago() {
    this.tabDocummento = false;
    this.tabDetalle = false;
    this.tabPago = true;
  }

  //nuevo documento
  async newDoc() {

    //Dialofo de confirmacion
    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    //limpiar todos los datos relacionados al documennto
    this.facturaService.cuenta = undefined; //cuneta correntista seleccionada
    this.facturaService.montos = []; //cargo abonos agregaods al documento
    this.facturaService.traInternas = []; //transacciones agregadas al documento
    this.facturaService.selectAllTra = false; //sleeccionar todas las transaciones (false)
    this.facturaService.subtotal = 0; //reniciar subtotal del documento
    this.facturaService.cargo = 0;  //reiniciar cargos el documento
    this.facturaService.descuento = 0;  //reiniciar descuentos del documento
    this.facturaService.total = 0;  //reiniciar toral del documenmto
    this.facturaService.saldo = 0;  //reiniciar saldo del documento
    this.facturaService.cambio = 0; //reiniciar cambio del documento
    this.facturaService.pagado = 0; //reiniciar monto pagado del
    this.facturaService.tipoReferencia = undefined;
    this.facturaService.fechaEntrega = undefined;
    this.facturaService.fechaRecoger = undefined;
    this.facturaService.fechaIni = undefined;
    this.facturaService.fechaFin = undefined;
    this.facturaService.refContacto = undefined;
    this.facturaService.refDescripcion = undefined;
    this.facturaService.refDireccionEntrega = undefined;
    this.facturaService.refObservacion = undefined;
    this.setDateNow();


    //si hay solo una serie disponoble
    if (this.facturaService.series.length == 1) {
      //seleccionar la serie
      this.facturaService.serie = this.facturaService.series[0];
    } else {
      //si hay mas de una no seleccionar ninguna
      this.facturaService.serie = undefined
    }


    //si hay solo una tipo referencia disponoble
    if (this.facturaService.tiposReferencia.length == 1) {
      //seleccionar la tipo referencia
      this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
    } else {
      //si hay mas de una no seleccionar ninguna
      this.facturaService.tipoReferencia = undefined
    }

    //si solo un vendedor dipsonible
    if (this.facturaService.vendedores.length == 1) {
      //seleccionar el vendedor
      this.facturaService.vendedor = this.facturaService.vendedores[0];

    } else {
      //si hay mas de uno no sleccionarlo
      this.facturaService.vendedor = undefined; //

    }

    //Mostrar tab documento (primer pestaña)
    this.showDocumento();

    //limpiar documento local 
    PreferencesService.documento = "";

  }




  setDateNow() {

    // Inicializar selectedDate con la fecha de hoy
    this.facturaService.inputFechaInicial = this._calendar.getToday();
    this.facturaService.inputFechaFinal = this._calendar.getToday();
    this.facturaService.inputFechaEntrega = this._calendar.getToday();
    this.facturaService.inputFechaRecoger = this._calendar.getToday();

    this.facturaService.horaIncial = UtilitiesService.getHoraInput(this.facturaService.fecha);
    this.facturaService.horaFinal = UtilitiesService.getHoraInput(this.facturaService.fecha);
    this.facturaService.horaEntrega = UtilitiesService.getHoraInput(this.facturaService.fecha);
    this.facturaService.horaRecoger = UtilitiesService.getHoraInput(this.facturaService.fecha);



    this.facturaService.fechaEntrega = this.convertValidDate(this.facturaService.inputFechaEntrega!, this.facturaService.horaEntrega);
    this.facturaService.fechaRecoger = this.convertValidDate(this.facturaService.inputFechaRecoger!, this.facturaService.horaRecoger);
    this.facturaService.fechaIni = this.convertValidDate(this.facturaService.inputFechaInicial!, this.facturaService.horaIncial);
    this.facturaService.fechaFin = this.convertValidDate(this.facturaService.inputFechaFinal!, this.facturaService.horaFinal);

  }

  convertValidDate(date: NgbDateStruct, timeString: string): Date {
    // Separar la cadena de tiempo en horas, minutos y AM/PM
    const { year, month, day } = date;
    const [time, meridiem] = timeString.split(' ');
    const [hoursString, minutesString] = time.split(':');

    let hours = parseInt(hoursString);
    const minutes = parseInt(minutesString);

    // Convertir las horas a formato de 24 horas si es PM
    if (meridiem.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
      hours = 0; // Si es 12:xx AM, lo convertimos a 0 horas
    }

    return new Date(year, month - 1, day, hours, minutes);
  }


  //cargar datos necesarios
  async loadData() {



    //limpiar datos del modulo
    this.facturaService.clearData();
    this.setDateNow();



    //Seleccionar primera pestaña (petssña documento)
    this.showDocumento();

    //Si no hay tipo de documento validar
    if (!this.facturaService.tipoDocumento) {
      this.verError({
        response: this._translate.instant('pos.factura.sin_tipo_documento'),
        status: false,
      })
      return;
    }

    //Datos de la sesion
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;
    let estacion: number = PreferencesService.estacion.estacion_Trabajo;
    let documento: number = this.facturaService.tipoDocumento;

    this.facturaService.isLoading = true;

    //Buscar series
    let resSeries: ResApiInterface = await this._serieService.getSerie(
      user,
      token,
      documento,
      empresa,
      estacion,
    );

    //si algo salio al
    if (!resSeries.status) {
      this.facturaService.isLoading = false;
      this.verError(resSeries);
      return;
    }

    //Series disponobles
    this.facturaService.series = resSeries.response;

    //si solo hay una serie seleccionarla por defecto;
    if (this.facturaService.series.length == 1) {
      //seleccionar serie
      this.facturaService.serie = this.facturaService.series[0];
      let serie: string = this.facturaService.serie.serie_Documento;

      //buscar vendedores
      let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
        user,
        token,
        documento,
        serie,
        empresa,
      )

      //si algo salió mal mostrar error
      if (!resVendedor.status) {
        this.facturaService.isLoading = false;
        this.verError(resVendedor);

        return;
      }


      //cuntas correntista ref disponibles
      this.facturaService.vendedores = resVendedor.response;

      //si solo hay un vendedor seleccionarlo por defecto
      if (this.facturaService.vendedores.length == 1) {
        this.facturaService.vendedor = this.facturaService.vendedores[0];
      }

      //Buscar tipos transaccion
      let resTransaccion: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
        user,
        token,
        documento,
        serie,
        empresa,
      );

      //si algo salio mal
      if (!resTransaccion.status) {
        this.facturaService.isLoading = false;
        this.verError(resTransaccion);

        return;
      }

      //tioos de trabnsaccion disponibles
      this.facturaService.tiposTransaccion = resTransaccion.response;

      //Buscar parametros del documento
      let resParametro: ResApiInterface = await this._parametroService.getParametro(
        user,
        token,
        documento,
        serie,
        empresa,
        estacion,
      )



      //si algo salio mal
      if (!resParametro.status) {
        this.facturaService.isLoading = false;
        this.verError(resParametro);

        return;
      }

      //Parammetros disponibles
      this.facturaService.parametros = resParametro.response;




      //Buscar formas de pago
      let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
        token,
        empresa,
        serie,
        documento,
      );

      //si algo salio mal
      if (!resFormaPago.status) {
        this.facturaService.isLoading = false;

        this.verError(resFormaPago);

        return;

      }

      //Formas de pago disponobles
      this.facturaService.formasPago = resFormaPago.response;

    }


    if (this.facturaService.valueParametro(58)) {

      this.facturaService.tipoReferencia = undefined;
      this.facturaService.tiposReferencia = [];


      let resTipoRefencia: ResApiInterface = await this._referenciaService.getTipoReferencia(user, token);


      //si algo salio mal
      if (!resTipoRefencia.status) {
        this.facturaService.isLoading = false;

        this.verError(resTipoRefencia);

        return;

      }


      this.facturaService.tiposReferencia = resTipoRefencia.response;


      if (this.facturaService.tiposReferencia.length == 1) {
        this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
      }


    }


    //cargar documento guardado localmente



    if (!this.globalConvertService.editDoc) {

      this.facturaService.isLoading = false;
      this.facturaService.loadDocDave();
      return;
    }

    //Cargar datos del docuemnto origen


    //Verificar serie

    let docOrigin: OriginDocInterface = this.globalConvertService.docOriginSelect!;


    let serieOrigen = docOrigin.serie_Documento;


    let existRef: number = -1;

    for (let i = 0; i < this.facturaService.tiposReferencia.length; i++) {
      const element = this.facturaService.tiposReferencia[i];
      if (element.tipo_Referencia == docOrigin.tipo_Referencia) {
        existRef = i;
        break;
      }
    }


    if (existRef == -1) {
      this._notificationService.openSnackbar("No se pudo encontrar el tipo de referencia.");
    } else {

      this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[existRef];


    }

    let existCuentaRef: number = -1;

    for (let i = 0; i < this.facturaService.vendedores.length; i++) {
      const element = this.facturaService.vendedores[i];
      if (element.cuenta_Correntista == docOrigin.cuenta_Correntista_Ref) {
        existCuentaRef = i;
        break;
      }
    }


    if (existCuentaRef == -1) {
      this._notificationService.openSnackbar("No se pudo encontrar la cuenta correntista ref.");

    } else {
      this.facturaService.vendedor = this.facturaService.vendedores[existCuentaRef];
    }



    //--EMpiezan datos
    //Cargar cliente
    let resClient: ResApiInterface = await this._cuentaService.getClient(
      user,
      token,
      empresa,
      docOrigin.nit,

    );

    //si algo salio mal
    if (!resClient.status) {
      this.facturaService.isLoading = false;

      this.verError(resClient);

      return;

    }

    //Buscar cliente y asiganrlo
    let clients: ClienteInterface[] = resClient.response;


    let existClient: number = -1;

    for (let i = 0; i < clients.length; i++) {
      const element = clients[i];
      if (element.cuenta_Correntista == docOrigin.cuenta_Correntista) {
        existClient = i;
        break;
      }
    }

    if (existClient == -1) {
      this.facturaService.cuenta = {
        cuenta_Correntista: 1,
        cuenta_Cta: docOrigin.cuenta_Cta,
        factura_Nombre: docOrigin.cliente,
        factura_NIT: docOrigin.nit,
        factura_Direccion: docOrigin.direccion,
        cC_Direccion: docOrigin.direccion,
        des_Cuenta_Cta: docOrigin.nit,
        direccion_1_Cuenta_Cta: docOrigin.direccion,
        eMail: "",
        telefono: "",
        limite_Credito: 0,
        permitir_CxC: false,
        celular: null,
        des_Grupo_Cuenta: null,
        grupo_Cuenta: null
      }

    } else {
      this.facturaService.cuenta = clients[existClient];
    }

    //Set dates and observaciones
    let dateDefault: Date = new Date()

    //load dates 
    this.facturaService.fechaEntrega = new Date(docOrigin.referencia_D_Fecha_Ini ?? dateDefault);
    this.facturaService.fechaRecoger = new Date(docOrigin.referencia_D_Fecha_Fin ?? dateDefault);
    this.facturaService.fechaIni = new Date(docOrigin.fecha_Ini ?? dateDefault);
    this.facturaService.fechaFin = new Date(docOrigin.fecha_Fin ?? dateDefault);


    //set dates in inputs
    this.facturaService.inputFechaEntrega = {
      year: this.facturaService.fechaEntrega.getFullYear(),
      day: this.facturaService.fechaEntrega.getDate(),
      month: this.facturaService.fechaEntrega.getMonth() + 1,
    }

    this.facturaService.inputFechaRecoger = {
      year: this.facturaService.fechaRecoger.getFullYear(),
      day: this.facturaService.fechaRecoger.getDate(),
      month: this.facturaService.fechaRecoger.getMonth() + 1,
    }

    this.facturaService.inputFechaInicial = {
      year: this.facturaService.fechaIni.getFullYear(),
      day: this.facturaService.fechaIni.getDate(),
      month: this.facturaService.fechaIni.getMonth() + 1,
    }

    this.facturaService.inputFechaFinal = {
      year: this.facturaService.fechaFin.getFullYear(),
      day: this.facturaService.fechaFin.getDate(),
      month: this.facturaService.fechaFin.getMonth() + 1,
    }

    //set time
    this.facturaService.horaIncial = UtilitiesService.getHoraInput(this.facturaService.fechaIni);
    this.facturaService.horaFinal = UtilitiesService.getHoraInput(this.facturaService.fechaFin);
    this.facturaService.horaEntrega = UtilitiesService.getHoraInput(this.facturaService.fechaEntrega);
    this.facturaService.horaRecoger = UtilitiesService.getHoraInput(this.facturaService.fechaRecoger);


    // set observaciones
    this.facturaService.refContacto = docOrigin.referencia_D_Observacion_2 ?? undefined;
    this.facturaService.refDescripcion = docOrigin.referencia_D_Descripcion ?? undefined;
    this.facturaService.refDireccionEntrega = docOrigin.referencia_D_Observacion_3 ?? undefined;
    this.facturaService.refObservacion = docOrigin.referencia_D_Observacion ?? undefined;




    //TODO:Cargar productos
    for (const tra of this.globalConvertService.detailsOrigin) {
      let resProduct = await this._productService.getProductId(
        token,
        tra.detalle.id,
      );


      if (!resProduct.status) {
        this.facturaService.isLoading = false;

        this.verError(resProduct);

        return;
      }

      let productSearch: ProductoInterface[] = resProduct.response;


      let iProd: number = -1;

      for (let i = 0; i < productSearch.length; i++) {
        const element = productSearch[i];

        if (element.producto_Id = tra.detalle.id) {
          iProd = i;
          break;
        }

      }

      if (iProd == -1) {

        this.facturaService.isLoading = false;


        resProduct.response = "Error al cargar las transacciones, no se encontró un producto";

        this.verError(resProduct);

        return;



      }


      let prod: ProductoInterface = productSearch[iProd];

      //buscar bodegas del producto
      let resBodega = await this._productService.getBodegaProducto(
        user,
        token,
        empresa,
        estacion,
        prod.producto,
        prod.unidad_Medida,
      );


      if (!resBodega.status) {

        this.facturaService.isLoading = false;

        this.verError(resBodega);

        return;

      }

      let bodegas: BodegaProductoInterface[] = resBodega.response;

      let existBodega: number = -1;

      //Search bodega
      for (let i = 0; i < bodegas.length; i++) {
        const element = bodegas[i];
        if (element.bodega == tra.detalle.bodega) {
          existBodega = i;
          break;
        }
      }



      let bodega: BodegaProductoInterface;

      if (existBodega == -1) {
        //No hay bodegas
        bodega = {
          bodega: tra.detalle.bodega,
          existencia: 0,
          nombre: tra.detalle.bodega_Descripcion,
        }

      } else {
        bodega = bodegas[existBodega];
      }


      //buscar precios
      let resPrecio = await this._productService.getPrecios(
        this.user,
        token,
        bodega.bodega,
        prod.producto,
        prod.unidad_Medida,
      );



      if (!resPrecio.status) {

        this.facturaService.isLoading = false;

        this.verError(resPrecio);

        return;

      }

      let precios: PrecioInterface[] = resPrecio.response;


      let existPrecio: number = -1;

      for (let i = 0; i < precios.length; i++) {
        const element = precios[i];
        if (element.tipo_Precio = tra.detalle.tipo_Precio) {
          existPrecio = i;
          break;
        }
      }

      let precioSelect: UnitarioInterface;

      if (existPrecio == -1) {
        //TODO:Seacrh factor de conversion
        precioSelect = {
          descripcion: "Precio",
          id: tra.detalle.tipo_Precio,
          moneda: 1,
          orden: 1,
          precio: true,
          precioU: tra.detalle.disponible ? 0 : tra.detalle.monto / tra.detalle.disponible
        }
      } else {
        precioSelect = {
          descripcion: precios[existPrecio].des_Tipo_Precio,
          id: precios[existPrecio].tipo_Precio,
          moneda: precios[existPrecio].moneda,
          orden: precios[existPrecio].precio_Orden,
          precio: true,
          precioU: precios[existPrecio].precio_Unidad
        }
      }


      let precioDias: number = 0;

      if (this.facturaService.valueParametro(351)) {


        let strFechaIni: string = this.facturaService.formatstrDateForPriceU(this.facturaService.fechaIni!);
        let strFechaFin: string = this.facturaService.formatstrDateForPriceU(this.facturaService.fechaFin!);


        let res: ResApiInterface = await this._productService.getFormulaPrecioU(
          token,
          strFechaIni,
          strFechaFin,
          precioSelect.precioU.toString(),
        );

        if (!res.status) {
          this._notificationService.openSnackbar(this._translate.instant("No se pudo calcular el precio por días."));

          console.error(res);

          return;
        }

        precioDias = res.response.data;

      }

      this.facturaService.addTransaction(
        {
          //TODO:Agregar montos por dia
          precioCantidad: precioSelect.precioU * tra.detalle.disponible,
          precipDia: precioDias,
          isChecked: false,
          bodega: bodega,
          producto: prod,
          precio: precioSelect,
          cantidad: tra.detalle.disponible,
          total: tra.detalle.monto,
          cargo: 0,
          descuento: 0,
          operaciones: [],
        }
      );


    }

    this.facturaService.isLoading = false;


    return;

    if (this.facturaService.series.length == 1 && serieOrigen == this.facturaService.serie!.serie_Documento) {

      //TODO:Cargar demas datos



      //buscar 



      this.facturaService.isLoading = false;
      return;
    }

    let existSerie: number = -1;

    for (let i = 0; i < this.facturaService.series.length; i++) {
      const element = this.facturaService.series[i];

      if (element.serie_Documento == serieOrigen) {
        existSerie = i;
        break;
      }

    }


    if (existSerie == -1) {
      this.facturaService.isLoading = false;
      //TODO:Bloquear pantalla porque la serie no existe

      return;
    }

    //TODO:Seleccionar serie y cargar datos





    this.facturaService.isLoading = false;


  }


  async modifyDoc() {
    //TODO:Translate
    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: "¿Estás seguro?",
        description: "Se aplicaran los cambios al documento.",
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;
  }


  //ver oabtalal crear cuenta correntista
  verNuevoCliente() {
    this.nuevoCliente = true;
    this.actualizarCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver pabtralla editar cuenta coprrenitsta
  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver modulo de factura
  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //Confirmar documento
  verResumen() {

    //Si no hay serie seleccionado mostrar mensaje
    if (!this.facturaService.serie) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinSerie'));
      return;
    }

    //Si no hay cliente seleccioando mostrar mensaje
    if (!this.facturaService.cuenta) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinCliente'));
      return;
    }


    //si hay vendedores debe seleconarse uno
    if (this.facturaService.vendedores.length > 0) {
      //Si no hay cliente seleccioando mostrar mensaje
      if (!this.facturaService.vendedor) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinVendedor'));
        return;
      }
    }

    //si no hay transacciones mostrar mensaje
    if (this.facturaService.traInternas.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinTransacciones'));
      return;
    }

    //si hay formas de pago validar quye se agregue alguna
    if (this.facturaService.serie && this.facturaService.formasPago.length > 0) {
      if (this.facturaService.montos.length == 0) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinPagos'));
        return;
      }

      // si no se ha pagado el total mostrar mensaje
      if (this.facturaService.saldo > 0) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.saldoPendiente'));
        return;
      }
    }


    if (this.facturaService.valueParametro(58)) {
      if (!this.facturaService.tipoReferencia) {

        this._notificationService.openSnackbar("Debe seelccionar un tipo de referencia.");
        return;
      }
    }

    //ir a resumen
    this.vistaResumen = true;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver histirial de documentos recienetes
  verHistorial() {
    this.vistaHistorial = true;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaInforme = false;
  }

  //ver informe de erroes
  verInformeError() {
    this.vistaInforme = true;
    this.vistaHistorial = false;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  //verError
  verError(res: ResApiInterface) {

    //fehca y hora ctual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error
    PreferencesService.error = error;

    //ver pantlla d error
    this.verInformeError();
  }

}

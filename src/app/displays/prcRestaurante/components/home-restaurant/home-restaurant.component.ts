import { Component, OnInit, ViewChild } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { LocationInterface } from '../../interfaces/location.interface';
import { TableInterface } from '../../interfaces/table.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { MatSidenav } from '@angular/material/sidenav';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { SerieInterface } from 'src/app/displays/prc_documento_3/interfaces/serie.interface';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { RestaurantService } from '../../services/restaurant.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { LoadRestaurantService } from '../../services/load.restaurant.service';
import { RenameCheckComponent } from '../rename-check/rename-check.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageRestaurantComponent } from '../image-restaurant/image-restaurant.component';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { OrderInterface } from '../../interfaces/order.interface';
import { GarnishTraInteface } from '../../interfaces/garnish.interface';
import { Documento, Transaccion } from 'src/app/displays/prc_documento_3/interfaces/doc-estructura.interface';
import { PostDocumentInterface } from 'src/app/displays/prc_documento_3/interfaces/post-document.interface';
import { DocumentService } from 'src/app/displays/prc_documento_3/services/document.service';
import { DataComandaInterface, FormatoComandaInterface } from '../../interfaces/data-comanda.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { ErrorComandaComponent } from '../error-comanda/error-comanda.component';
import { PermisionsComponent } from '../permisions/permisions.component';
import { TraRestaurantInterface } from '../../interfaces/tra.restaurant.interface';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-home-restaurant',
  templateUrl: './home-restaurant.component.html',
  styleUrls: ['./home-restaurant.component.scss'],
  providers: [
    RestaurantService,
    ProductService,
    SerieService,
    PrinterService,
    DocumentService,
  ]
})
export class HomeRestaurantComponent implements OnInit {


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  series: SerieInterface[] = [];

  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  readonly regresar: number = 21; //id de la pnatalla

  nombreDocumento: string = "1 ejemplo"; //Descripcion del tipo de documento
  documentoName: string = ""; //Descripcion tipo de documento



  constructor(
    private notificationService: NotificationsService,
    public restaurantService: GlobalRestaurantService,
    public dataUserService: DataUserService,
    private _restaurantService: RestaurantService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _facturaService: FacturaService,
    private _serieService: SerieService,
    private _eventService: EventService,
    private _loadRestaurantService: LoadRestaurantService,
    private _dialog: MatDialog,
    private _documentService: DocumentService,
    private _printService: PrinterService,
  ) {

  }



  ngOnInit(): void {

    this.loadData();


  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  viewLocationTable() {
    this.restaurantService.indexCheck = -1; //regresar y limpiar indice de cuenta seleccionada
    this.restaurantService.verDetalleOrden = false; //Se oculta
    this.restaurantService.viewLocations = true;
    this.restaurantService.viewRestaurant = false;
    this.restaurantService.viewMoveCheckTable = false;
  }

  viewRestaurant() {
    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;
    this.restaurantService.viewMoveCheckTable = false;
  }

  viewMoveCheckTable() {

    if (this.restaurantService.orders.length == 0) {
      this._notificationService.openSnackbar("No hay cuentas para trasladar"); //TODO:Translate
      return;
    }

    let dialogRef = this._dialog.open(PermisionsComponent, {})

    dialogRef.afterClosed().subscribe(result => {

      let credenciales = result;

      if (credenciales) {
        this.restaurantService.viewMoveCheckTable = true;
        this.restaurantService.viewLocations = false;
        this.restaurantService.viewRestaurant = false;
        this.restaurantService.selectCheckOrTran = true;
        // this.restaurantService.selectNewLocation = false;
        this.marcarFalse();
        return;
      }

    })

  }

  viewMoveTable() {

    if (this.restaurantService.orders.length == 0) {
      this._notificationService.openSnackbar("No hay cuentas para trasladar"); //TODO:Translate
      return;
    }

    let dialogRef = this._dialog.open(PermisionsComponent, {})

    dialogRef.afterClosed().subscribe(result => {

      let credenciales = result;

      if (credenciales) {
        this.restaurantService.tipoTraslado = 3; // Mesa
        this.restaurantService.viewRestaurant = false;
        this.restaurantService.selectCheckOrTran = false; //ocultar cuentas y transacciones 
        this.restaurantService.viewMoveCheckTable = true;
        this.restaurantService.selectNewLocation = true;
        // this.marcarFalse();
        return;
      }

    })

  }

  marcarFalse() {
    if (this.restaurantService.orders) {
      // Recorremos cada elemento de la lista de orders
      this.restaurantService.orders.forEach(order => {
        order.selected = false;  // Marcamos la propiedad 'selected' en false para cada order

        // Verificamos si la orden tiene transacciones y las recorremos
        if (order.transacciones) {
          order.transacciones.forEach(transaccion => {
            transaccion.selected = false;  // Marcamos la propiedad 'selected' en false para cada transacción
          });
        }
      });
    }
  }

  selectCheckAll() {

    this.restaurantService.selectAllChecks = !this.restaurantService.selectAllChecks;

    this.restaurantService.orders.forEach(element => {
      element.selected = this.restaurantService.selectAllChecks;
    });
  }

  selectTranCheckAll() {

    this.restaurantService.selectTranAllChecks = !this.restaurantService.selectTranAllChecks;

    this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones.forEach(element => {
      element.selected = this.restaurantService.selectTranAllChecks;
    });
  }

  backHome() {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  sendDoc() { }

  verHistorial() { }

  newDoc() { }

  printDoc() { }


  changeSerie() {


  }

  goChecks() {
    // this.restaurantService.nameCheck = "";
    this.restaurantService.indexCheck = -1;
    this.restaurantService.viewTranCheck = false;
    this.restaurantService.viewCheck = true;
  }

  verDetalles() {

    if (this.restaurantService.table?.orders.length == 0) {
      this._notificationService.openSnackbar("No hay detalles para visualizar"); //TODO:Translate
      return
    }

    this.restaurantService.verDetalleOrden = !this.restaurantService.verDetalleOrden;
  }

  async newCheck() {
    let nombre: string = await this._notificationService.newCheck();

    if (nombre) {

      this.restaurantService.orders.push(
        {
          consecutivo: 0,
          consecutivoRef: 0,
          mesa: this.restaurantService.table!,
          mesero: this.restaurantService.waiter!,
          nombre: nombre,
          selected: false,
          transacciones: [],
          ubicacion: this.restaurantService.location!,
        }

      );
      
      this._notificationService.openSnackbar(this._translate.instant('pos.restaurante.cuentaCreada'));

      this.restaurantService.viewTranCheck = false;
      this.restaurantService.viewCheck = true;

      this.restaurantService.updateOrdersTable();
    }
  }


  async refresh() {

    switch (this.restaurantService.idPantalla) {
      case 1: //carga clasiificaciones
        this._loadRestaurantService.loadClassifications();
        break;
      case 2: //carga productos
        this._loadRestaurantService.loadProducts();

        break;

      default:
        this.loadData();
        break;
    }

  }


  async loadData() {



    this.restaurantService.isLoading = true;
    //cargar serie
    let resSerie: boolean = await this.loadSeries();

    //si algo salio mal
    if (!resSerie) {
      this.restaurantService.isLoading = false;
      return;
    };

    //Si no hay series mostrar mensaje
    if (this.series.length == 0) {

      this.restaurantService.isLoading = false;

      this._notificationService.openSnackbar("No existen series asignadas"); //TODO:Translate

      return;
    }

    //cargar ubicaciones
    let resLocation: boolean = await this.loadLocations();

    //Si algo salió mal
    if (!resLocation) {
      this.restaurantService.isLoading = false;
      return;
    };

    //Si solo hay una localizacion cargar mesas
    if (this.restaurantService.locations.length > 1) {
      this.restaurantService.isLoading = false;
      return;
    }

    //cargar mesa
    let resTable: boolean = await this.loadTables();

    //Si algo salió mal
    if (!resTable) {
      this.restaurantService.isLoading = false;
      return;
    };

    // //cargar serie
    // let resClasifications: boolean = await this.loadClassifications();

    // //si algo salio mal
    // if (!resClasifications) {
    //   this.restaurantService.isLoading = false;
    //   return;
    // };

  }


  //TODO:Implementar Try Catch
  async loadSeries(): Promise<boolean> {

    this.series = [];
    this.restaurantService.serie = undefined;

    const api = () => this._serieService.getSerie(
      this.user,
      this.token,
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.series = res.response;

    if (this.series.length > 0) {
      //TODO:Implementar en POS
      this.restaurantService.serie = this.series.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });
    }

    return true;

  }


  async loadLocations(): Promise<boolean> {

    this.restaurantService.locations = [];
    this.restaurantService.location = undefined;

    const api = () => this._restaurantService.getLocations(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.restaurantService.locations = res.response;

    if (this.restaurantService.locations.length == 1)
      this.restaurantService.location = this.restaurantService.locations[0];

    return true;
  }

  async loadTables(): Promise<boolean> {

    this.restaurantService.tables = [];
    this.restaurantService.table = undefined;

    const api = () => this._restaurantService.getTables(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.restaurantService.location!.elemento_Asignado,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.restaurantService.tables = res.response;

    if (this.restaurantService.tables.length == 1)
      this.restaurantService.table = this.restaurantService.tables[0];

    this.restaurantService.updateOrdersTable();

    return true;


  }

  async showError(res: ResApiInterface) {

    //Diaogo de confirmacion
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //Cancelar
    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //Guardar error
    PreferencesService.error = error;

    //TODO:mostrar pantalla de error

    this.restaurantService.verError = true;

    return;
  }


  async selectLocation(location: LocationInterface) {

    if (location == this.restaurantService.location) {
      return;
    }

    this.restaurantService.location = location;

    this.restaurantService.isLoading = true;
    await this.loadTables();
    this.restaurantService.isLoading = false;

  }

  selectTable(table: TableInterface) {
    this.restaurantService.table = table;

    if (this.restaurantService.indexCheck == -1 && this.restaurantService.table.orders.length == 0) {
      this.restaurantService.verDetalleOrden = false;
    }

    this.notificationService.pinMesero();

  }

  backClassifications() {
    this.restaurantService.idPantalla = 1; //Clasificaciones
  }

  selectCheck(index: number) {

    this.restaurantService.indexCheck = index;

    this.restaurantService.nameCheck = this.restaurantService.orders[index].nombre;

    if (!this.restaurantService.orders[index].transacciones.length) {
      this._notificationService.openSnackbar("Cuenta sin transacciones."); //TODO:Translate
      return;
    }

    this.restaurantService.viewTranCheck = true;
    this.restaurantService.viewCheck = false;
  }

  renombrar(index: number): Promise<any> {
    return new Promise((resolve, reject) => {

      let dialogRef = this._dialog.open(RenameCheckComponent, { data: index })

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  restar(indexTra: number) {


    if (this.restaurantService.orders[this.restaurantService.indexCheck].transacciones[indexTra].cantidad == 1) {
      this.restaurantService.orders[this.restaurantService.indexCheck].transacciones[indexTra].cantidad == 1;
      //TODO: mostrar iconp de basura y dialogo para eliminar transaccion
      return;
    }

    //disminuir cantidad en 1
    this.restaurantService.orders[this.restaurantService.indexCheck].transacciones[indexTra].cantidad--;

    this.calcTotal();
  }


  sumar(indexTran: number) {
    this.restaurantService.orders[this.restaurantService.indexCheck].transacciones[indexTran].cantidad++;
    this.calcTotal();
  }

  calcTotal() {

  }

  cantidad: number = 1;


  validarNumeros(event: any) {
    // Obtener el código de la tecla presionada
    let codigoTecla = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos de tecla entre 48 y 57 son números en el teclado)
    if (codigoTecla < 48 || codigoTecla > 57) {
      event.preventDefault();
    }
  }


  imagen(producto: ProductRestaurantInterface) {

    //TODO: borrar la imagen
    producto.objeto_Imagen = "https://aprende.guatemala.com/wp-content/uploads/2016/10/Receta-para-preparar-un-desayuno-chapin.jpg";

    if (producto.objeto_Imagen) {
      this._dialog.open(ImageRestaurantComponent, { data: producto })
      return;
    }

    this._notificationService.openSnackbar("No hay imagen asociada a este producto"); //TODO:Translate

  }

  getGuarniciones(indexTra: number): string {
    let order: OrderInterface = this.restaurantService.orders[this.restaurantService.indexCheck];

    // Verificar si order, transacciones, guarniciones existen
    if (!order || !order.transacciones || !order.transacciones[indexTra] || !order.transacciones[indexTra].guarniciones) {
      return '';
    }

    let guarniciones: GarnishTraInteface[] = order.transacciones[indexTra].guarniciones;

    return guarniciones
      .map((garnish) => {
        const garnishDescriptions = garnish.garnishs
          .map((guarnicion) => guarnicion.descripcion)
          .join(' ');

        // Verificar si garnish.selected existe y tiene descripcion
        const selectedDescription = garnish.selected?.descripcion || '';

        return `${garnishDescriptions} ${selectedDescription}`;
      })
      .join(', ');
  }
  //Comandar
  async printComanda(indexOrder: number) {

    if (this.restaurantService.orders.length > 0 && !this.restaurantService.viewTranCheck) {
      this._notificationService.openSnackbar("Seleccione una cuenta para comandar."); //TODO:Translate
      return;
    }

    let traTotal: number = 0;
    let transactions: Transaccion[] = [];


    let firstPart: number = 0;
    if (!this.restaurantService.orders[indexOrder].consecutivoRef) {
      firstPart = this.restaurantService.orders[indexOrder].consecutivoRef;
    } else {
      firstPart = Math.floor(Math.random() * 900) + 100;
    }

    let consecutivo: number = -1;

    this.restaurantService.orders[indexOrder].transacciones.forEach(tra => {
      let padre: number = consecutivo;

      tra.guarniciones.forEach(element => {
        consecutivo++;


        let fBodega: number = 0;
        let fProducto: number = 0;
        let fUnidadMedida: number = 0;
        let fCantidad: number = 0;

        if (element.selected.f_Producto) {
          fBodega = element.selected.f_Bodega!;
          fProducto = element.selected.f_Producto;
          fUnidadMedida = element.selected.f_Unidad_Medida!;
          fCantidad = element.selected.cantidad ?? 0;
        } else {
          for (let i = 0; i < element.garnishs.length; i++) {
            const garnish = element.garnishs[i];

            fBodega = garnish.f_Bodega!;
            fProducto = garnish.f_Producto!;
            fUnidadMedida = garnish.f_Unidad_Medida!;
            fCantidad = garnish.cantidad ?? 0;
          }
        }

        transactions.push(
          {
            D_Consecutivo_Interno: firstPart,
            Tra_Bodega: fBodega,
            Tra_Cantidad: fCantidad,
            Tra_Consecutivo_Interno: consecutivo,
            Tra_Consecutivo_Interno_Padre: padre,
            Tra_Factor_Conversion: !tra.precio.precio ? tra.precio.id : null,
            Tra_Moneda: tra.precio.moneda,
            Tra_Monto: tra.cantidad * tra.precio.precioU,
            Tra_Monto_Dias: null,
            Tra_Producto: fProducto,
            Tra_Tipo_Cambio: this.tipoCambio,
            Tra_Tipo_Precio: tra.precio.precio ? tra.precio.id : null,
            Tra_Tipo_Transaccion: 1,//TODO:Hace falta,
            Tra_Unidad_Medida: fUnidadMedida,
            Tra_Observacion: `${element.garnishs.map(e => e.descripcion).join(" ")} ${element.selected.descripcion}`,
          }
        );

      });


      transactions.push(
        {
          D_Consecutivo_Interno: firstPart,
          Tra_Bodega: tra.bodega.bodega,
          Tra_Cantidad: tra.cantidad,
          Tra_Consecutivo_Interno: padre,
          Tra_Consecutivo_Interno_Padre: null,
          Tra_Factor_Conversion: !tra.precio.precio ? tra.precio.id : null,
          Tra_Moneda: tra.precio.moneda,
          Tra_Monto: tra.cantidad * tra.precio.precioU,
          Tra_Monto_Dias: null,
          Tra_Observacion: tra.observacion,
          Tra_Producto: tra.producto.producto,
          Tra_Tipo_Cambio: this.tipoCambio,
          Tra_Tipo_Precio: tra.precio.precio ? tra.precio.id : null,
          Tra_Tipo_Transaccion: 1, //TODO:Hace falta
          Tra_Unidad_Medida: tra.producto.unidad_Medida,
        }
      );

      traTotal += tra.cantidad * tra.precio.precioU;

      consecutivo++;

    });



    //Obtener fecha y hora actual
    let currentDate: Date = new Date();


    let dateConsecutivo: Date = new Date();

    let randomNumber1: number = Math.floor(Math.random() * 900) + 100;

    // Combinar los dos números para formar uno de 14 dígitos
    let strNum1: string = randomNumber1.toString();
    let combinedStr: string = strNum1 +
      dateConsecutivo.getDate() +
      (dateConsecutivo.getMonth() + 1) +
      dateConsecutivo.getFullYear() +
      dateConsecutivo.getHours() +
      dateConsecutivo.getMinutes() +
      dateConsecutivo.getSeconds();

    //ref id
    let idDocumentoRef = parseInt(combinedStr, 10);

    let doc: Documento = {
      Consecutivo_Interno: firstPart,
      Doc_CA_Monto: 0,
      Doc_Cargo_Abono: [],
      Doc_Confirmar_Orden: false,
      Doc_Cuenta_Correntista: 1, //Parametrizar,
      Doc_Cuenta_Correntista_Ref: this.restaurantService.orders[indexOrder].mesero.cuenta_Correntista,
      Doc_Cuenta_Cta: this.restaurantService.orders[indexOrder].mesero.cuenta_Cta,
      Doc_Elemento_Asignado: 1, //TODO: Hace falta
      Doc_Empresa: this.empresa.empresa,
      Doc_Estacion_Trabajo: this.estacion.estacion_Trabajo,
      Doc_Fecha_Documento: currentDate.toISOString(),
      Doc_Fecha_Fin: null,
      Doc_Fecha_Ini: null,
      Doc_FEL_fechaCertificacion: null,
      Doc_FEL_numeroDocumento: null,
      Doc_FEL_Serie: null,
      Doc_FEL_UUID: null,
      Doc_ID_Certificador: null,
      Doc_ID_Documento_Ref: idDocumentoRef,
      Doc_Observacion_1: "",
      Doc_Ref_Descripcion: null,
      Doc_Ref_Fecha_Fin: null,
      Doc_Ref_Fecha_Ini: null,
      Doc_Ref_Observacion: null,
      Doc_Ref_Observacion_2: null,
      Doc_Ref_Observacion_3: null,
      Doc_Ref_Tipo_Referencia: null,
      Doc_Serie_Documento: this.restaurantService.serie!.serie_Documento,
      Doc_Tipo_Documento: this.tipoDocumento,
      Doc_Tipo_Pago: 1,//TODO:  Hace falta
      Doc_Tra_Monto: traTotal,
      Doc_Transaccion: transactions,
      Doc_UserName: this.user,
    }

    let document: PostDocumentInterface = {
      estado: 1,
      estructura: JSON.stringify(doc),
      user: this.user,
    }

    if (!this.restaurantService.orders[indexOrder].consecutivo) {


      const apiPostDoc = () => this._documentService.postDocument(this.token, document);

      this.restaurantService.isLoading = true;

      //consumo del servico para crear el documento
      let resDoc = await ApiService.apiUse(apiPostDoc);
      this.restaurantService.isLoading = false;

      if (!resDoc.response) {

        this.showError(resDoc);
        return;
      }

      this.restaurantService.orders[indexOrder].consecutivo = resDoc.response.data;



    } else {

      const apiPostDoc = () => this._documentService.updateDocument(
        this.token,
        document,
        this.restaurantService.orders[indexOrder].consecutivo,
      );

      this.restaurantService.isLoading = true;

      //consumo del servico para crear el documento
      let resDoc = await ApiService.apiUse(apiPostDoc);
      this.restaurantService.isLoading = false;

      if (!resDoc.response) {

        this.showError(resDoc);
        return;
      }



    }

    //TODO:Verificar depues de comandadas (impresion)
    this.restaurantService.orders[indexOrder].transacciones.forEach(element => {
      element.processed = true;
    });


    //TODO:Usao web socket

    await this.directPrint(indexOrder);

    this.restaurantService.isLoading = false;

  }

  async directPrint(indexOrder: number) {

    let api = () => this._documentService.getDataComanda(
      this.user,
      this.token,
      this.restaurantService.orders[indexOrder].consecutivo,
    );

    this.restaurantService.isLoading = true;


    let res = await ApiService.apiUse(api);


    if (!res.status) {
      this.restaurantService.isLoading = false;
      this.showError(res);
      return;
    }

    let detalles: DataComandaInterface[] = res.response;
    let formats: FormatoComandaInterface[] = [];


    detalles.forEach(detalle => {
      let item: FormatoComandaInterface = {
        bodega: detalle.bodega,
        detalles: [detalle],
        ipAdress: 'POS-80',
        // encabezado.impresora = "POS-80"

        // ipAdress: detalle.printerName,
        error: "",
      };

      if (formats.length == 0) {


        formats.push(item);
      } else {
        let indexBodega: number = -1;
        for (let i = 0; i < formats.length; i++) {
          const formato = formats[i];
          if (detalle.bodega == formato.bodega) {
            indexBodega = i;
            break;
          }
        }

        if (indexBodega == -1) {
          formats.push(item);
        } else {
          formats[indexBodega].detalles.push(detalle);
        }

      }

    });




    //Imprimir formatos
    for (const format of formats) {

      const docDefinition = await this._printService.getComandaTMU(format);

      let resService: ResApiInterface = await this._printService.getStatus();

      if (!resService.status) {
        format.error = this._translate.instant('pos.alertas.sin_servicio_impresion');
      }

      if (!format.error) {

        let resPrintStatus: ResApiInterface = await this._printService.getStatusPrint(format.ipAdress);

        if (!resPrintStatus.status) {
          format.error = `${this._translate.instant('pos.factura.impresora')} ${format.ipAdress} ${this._translate.instant('pos.factura.noDisponible')}.`;
        }


        if (!format.error) {
          const pdfDocGenerator = pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.pdfMake.vfs);

          // return;
          const blob = await UtilitiesService.generatePdfBlob(pdfDocGenerator);

          // ...
          var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

          let resPrint: ResApiInterface = await this._printService.postPrint(
            pdfFile,
            format.ipAdress,
            "1",
          );


          if (!resPrint.status) {

            format.error = "Fallo al imprimir";
            console.error(resPrint.response);

          }


        }

      }


    }

    this.restaurantService.isLoading = false;

    // Filtrar los elementos que tienen algo en la propiedad 'error'
    const comandasConError = formats.filter(comanda => comanda.error !== '');

    if (comandasConError.length > 0) {
      //TODO:Mostrar dialogo con errores para volver a imprimir y marcar como enviadas las que sí se enviaron

      this._dialog.open(ErrorComandaComponent, { data: comandasConError })

      return;
      // const doc = await this._printService.getComandaTMU(comandasConError[0]);
      // pdfMake.createPdf(doc, undefined, undefined, pdfFonts.pdfMake.vfs).open();
    } else {

      this.notificationService.openSnackbar("Comanda enviada");
    }

  }

  viewChecks() {
    this.restaurantService.viewChecksMove = true;
    this.restaurantService.viewTranCheckMove = false;
  }

  trasladarCuenta() {
    //abre las ubicaciones
    //selecciona nueva ubicacion y mesa

    let orders: OrderInterface[] = this.restaurantService.orders.filter((transaction) => transaction.selected);

    if (orders.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    this.restaurantService.tipoTraslado = 1;

    this.viewSelectNewLocation();
  }

  trasladarTran() {
    //abre las ubicaciones
    //selecciona la ubicacion, mesa y cuenta 

    let traCheks: TraRestaurantInterface[] = this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones.filter((transaction) => transaction.selected);

    if (traCheks.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    this.restaurantService.tipoTraslado = 2;

    this.viewSelectNewLocation();
  }

  viewSelectCheckOrTran() {
    //Si el tipo traslado es de mesa == 3
    if (this.restaurantService.tipoTraslado == 3) {
      this.restaurantService.selectCheckOrTran = false;
      this.restaurantService.selectNewLocation = false;
      this.restaurantService.viewRestaurant = true;
      return;
    }

    this.restaurantService.selectCheckOrTran = true;
    this.restaurantService.selectNewLocation = false;

  }

  viewSelectNewLocation() {
    this.restaurantService.selectCheckOrTran = false;
    this.restaurantService.selectNewLocation = true;
  }

}

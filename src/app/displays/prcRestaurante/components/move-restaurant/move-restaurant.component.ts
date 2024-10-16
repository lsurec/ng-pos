import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { TableInterface } from '../../interfaces/table.interface';
import { LocationInterface } from '../../interfaces/location.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { ApiService } from 'src/app/services/api.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatStepper } from '@angular/material/stepper';
import { TraRestaurantInterface } from '../../interfaces/tra.restaurant.interface';
import { Transaccion, Documento } from 'src/app/displays/prc_documento_3/interfaces/doc-estructura.interface';
import { PostDocumentInterface } from 'src/app/displays/prc_documento_3/interfaces/post-document.interface';
import { DocumentService } from 'src/app/displays/prc_documento_3/services/document.service';

@Component({
  selector: 'app-move-restaurant',
  templateUrl: './move-restaurant.component.html',
  styleUrls: ['./move-restaurant.component.scss'],
  providers: [
    DocumentService,
  ]
})
export class MoveRestaurantComponent {

  @ViewChild('stepper') stepper?: MatStepper;

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  formNewLocation = this._formBuilder.group({
  });

  formNewTable = this._formBuilder.group({
  });

  formConfirm = this._formBuilder.group({
  });

  isEditable = true;

  //nuevas variables traslado
  newLocation?: LocationInterface; //nueva ubicacion
  newTable?: TableInterface; // nueva mesa
  indexNewCheck: number = -1; //nueva cuenta

  constructor(
    private _translate: TranslateService,
    private _formBuilder: FormBuilder,
    public restaurantService: GlobalRestaurantService,
    private _restaurantService: RestaurantService,
    private _facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _documentService: DocumentService,
  ) {

  }

  async selectLocation(location: LocationInterface) {

    if (location == this.newLocation) {
      return;
    }

    this.newLocation = location;

    this.restaurantService.isLoading = true;
    await this.loadTables();
    this.restaurantService.isLoading = false;
    this.stepper!.next();
  }

  selectTable(table: TableInterface) {
    this.newTable = table;

    this.stepper!.next();
  }

  timer: any; //temporizador

  mostrarCarga() {
    this.restaurantService.isLoading = true;
    this.timer = setTimeout(() => {
      this.restaurantService.isLoading = false;
    }, 5000);
  }

  mostrarError() {
    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: "Prueba del error.",
      storeProcedure: "Prueba del error.",
      url: "Sin URL, es prueba de error.",
    }

    //Guardar error
    PreferencesService.error = error;

    //TODO:mostrar pantalla de error

    this.restaurantService.verError = true;

    return;
  }

  async loadTables(): Promise<boolean> {

    this.restaurantService.tables = [];

    const api = () => this._restaurantService.getTables(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.newLocation!.elemento_Asignado, //Nueva ubicacion seleccionada
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
      this.newTable = this.restaurantService.tables[0];

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

  selectCheck(index: number) {
    this.indexNewCheck = index;
    this.stepper!.next();
  }

  async newCheck() {
    let nombre: string = await this._notificationService.newCheck();

    if (nombre) {

      this.restaurantService.orders.push(
        {
          consecutivo: 0,
          consecutivoRef: 0,
          mesa: this.newTable!,
          mesero: this.restaurantService.waiter!,
          nombre: nombre,
          selected: false,
          transacciones: [],
          ubicacion: this.newLocation!,
        }

      );

      this._notificationService.openSnackbar(this._translate.instant('pos.restaurante.cuentaCreada'));

      this.restaurantService.updateOrdersTable();
    }
  }

  cancelar() {
    this.stepper!.reset()
    this.viewRestaurant(); // regresar a restaurante
  }

  confirmar() {
    //traslado de cuentas
    if (this.restaurantService.tipoTraslado == 1)
      this.moveCheck();

    //traslado de transacciones
    if (this.restaurantService.tipoTraslado == 2)
      this.moveTranstacion();

    if (this.restaurantService.tipoTraslado == 3)
      this.moveTable();
  }

  async moveTable() {

    let contadorErr = 0;

    this.restaurantService.isLoading = true;

    for (const element of this.restaurantService.table!.orders) {

      this.restaurantService.orders[element].mesa = this.newTable!;
      this.restaurantService.orders[element].ubicacion = this.newLocation!;


      //TODO:Si se crean cambiar condicion
      if (this.restaurantService.orders[element].consecutivo) {
        let resOrder = await this.updateOrderRemote(element);
        if (!resOrder.status) {
          console.error(resOrder);
          contadorErr++;

        }
      }


    }
    this.restaurantService.isLoading = false;


    this.restaurantService.updateOrdersTable();

    if (contadorErr > 0) {
      this._notificationService.openSnackbar("Algo salió mal al actualizar los datos remotos."); //TODO:Translate

    } else {
      this._notificationService.openSnackbar("Las mesa se movió correctamente."); //TODO:Translate
    }


    this.viewRestaurant(); // regresar a restaurante

  }

  async moveTranstacion() {


    //mover transacciones localmente
    this.addTraToDoc(this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones);

    //Asigaar ordenes a las mesas
    this.restaurantService.updateOrdersTable();

    let err = 0;

    let resOrigin: ResApiInterface;

    this.restaurantService.isLoading = true;
    //actualizar documento estructura origen
    //TODO:Si siempre se crean las transacciones en doc estructura quitar if
    if (this.restaurantService.orders[this.restaurantService.indexMoveCheck].consecutivo) {

      resOrigin = await this.updateOrderRemote(this.restaurantService.indexMoveCheck);

      if (!resOrigin.status) {
        err++;
      }
    }

    let resDest: ResApiInterface;

    if (this.restaurantService.orders[this.restaurantService.indexMoveCheck].consecutivo) {

      resDest = await this.updateOrderRemote(this.indexNewCheck);
      if (!resDest.status) {
        err++;
      }
    }

    this.restaurantService.isLoading = false;


    if (err == 0) {

      this._notificationService.openSnackbar("Transacciones movidas exitosamente"); //TODO:Translate
      this.viewRestaurant(); // regresar a restaurante

    }


  }



  addTraToDoc(
    transacciones: TraRestaurantInterface[],
  ): void {



    for (let i = 0; i < transacciones.length; i++) {
      const transaction = transacciones[i];

      // Si la transacción está seleccionada
      if (transaction.selected) {
        // Agregar la transacción a la nueva cuenta, eliminarla y recursividad
        this.restaurantService.orders[this.indexNewCheck].transacciones.push(transaction);
        this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones.splice(i, 1);

        // Llamada recursiva
        this.addTraToDoc(this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones);

        break;
      }
    }
  }


  async moveCheck() {


    let contador: number = 0;
    let contadorErr: number = 0;

    this.restaurantService.isLoading = true;
    for (const element of this.restaurantService.orders) {

      if (element.selected) {

        element.mesa = this.newTable!;
        element.ubicacion = this.newLocation!;

        //TODO:Si se crea todo cammbiar condicion
        if (element.consecutivo) {

          let resupdate = await this.updateOrderRemote(contador);

          if (!resupdate.status) {
            contadorErr++;
            console.error(resupdate);
          }

        }
      }

      contador++;
    }

    this.restaurantService.isLoading = false;

    if (contadorErr > 0) {
      this._notificationService.openSnackbar("Algo salió mal al actualizar los datos remotos."); //TODO:Translate

    } else {
      this._notificationService.openSnackbar("Las cuentas se movieron correctamente."); //TODO:Translate
    }

    this.restaurantService.updateOrdersTable();

    this.viewRestaurant(); // regresar a restaurante

  }

  viewRestaurant() {
    //limpiar
    this.indexNewCheck = -1;
    this.newTable = undefined;
    this.newLocation = undefined;

    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;

    this.restaurantService.selectCheckOrTran = true; //mostrar cuentas
    this.restaurantService.selectNewLocation = false; //ocultar el destino del traslado
    this.restaurantService.viewMoveCheckTable = false; //ocultar contenido del traslado
    this.restaurantService.viewTranCheckMove = false; //ocultar las transacciones de la cuenta
    this.restaurantService.viewChecksMove = true; //mostrar las cuentas para trasladar
  }


  //Comandar
  async updateOrderRemote(indexOrder: number): Promise<ResApiInterface> {

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

        return resDoc;
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

        return resDoc;
      }


    }


    let succes: ResApiInterface = {
      response: "",
      status: true,
    }
    //TODO:Usao web socket

    return succes;



  }

}

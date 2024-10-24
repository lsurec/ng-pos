import { Component, OnInit } from '@angular/core';
import { Documento } from '../../interfaces/doc-estructura.interface';
import { DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';
import { DocumentService } from '../../services/document.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { GetDocInterface } from '../../interfaces/get-doc.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TipoTransaccionInterface } from '../../interfaces/tipo-transaccion.interface';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
  providers: [
    DocumentService,
  ]
})
export class HistorialComponent implements OnInit {

  isLoading: boolean = false; //Pantalla de carga
  historial: boolean = true;   //ver hisytorial
  detalleDocumento: boolean = false; //ver detalle de un docuento
  readonly regresar: number = 5; //id de la pantlla
  verError: boolean = false; // Ver pamtalla informe de errores

  recientes: boolean = true;
  pendientes: boolean = false;

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token;   //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo;  //Estacion de la sesion

  documentosRecientes: DocumentoResumenInterface[] = []; //documentos del historial
  documentosPendientes: DocumentoResumenInterface[] = []; //documentos del historial

  docSelect!: DocumentoResumenInterface; //documento seleccionado

  constructor(
    //instancias de los servicios necearios
    private _eventService: EventService,
    private _documentService: DocumentService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    public facturaService: FacturaService,
  ) {

    //Suscripcion a eventos desde componente shijo

    //Evento para mostla lista de documentos
    this._eventService.verHistorial$.subscribe((eventData) => {
      this.verHistorial();
    });

    //Coulatr informe de error
    this._eventService.regresarHistorial$.subscribe((eventData) => {
      this.verError = false;
    });
  }


  ngOnInit(): void {
    //cargar datos al inicio
    this.loadData();
  }

  //cargar datos necesarios
  async loadData() {

    //Vaciar lista de documentos si existen anteriores
    this.documentosRecientes = [];
    this.documentosPendientes = [];

    this.isLoading = true;

    const getApiDocPrcess = ()=> this._documentService.getStructureDocProcessed(
      this.user,
      this.token,
      this.searchDoc
    );

    //Obntner ultimos documentos relizados
    let resDocProcessed: ResApiInterface = await ApiService.apiUse(getApiDocPrcess); 

    //si algo salio mal
    if (!resDocProcessed.status) {

      this.isLoading = false;

      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resDocProcessed);

      return;

    }

    //documentos encontrados
    let docsRecents: GetDocInterface[] = resDocProcessed.response;

    this.documentosRecientes = await this.setDocument(docsRecents);

    //PARA DOCUMENTOS PENDIENTES DE MIGRAR
    const getApiDocPending = ()=>this._documentService.getStructureDosPendigs(
      this.user,
      this.token,
      this.searchDoc,
      this.searchUserDoc
    );

    //Obntner ultimos documentos relizados
    let resDocPending: ResApiInterface = await ApiService.apiUse(getApiDocPending); 

    //si algo salio mal
    if (!resDocPending.status) {

      this.isLoading = false;

      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resDocPending);

      return;

    }

    //documentos encontrados
    let docsPendings: GetDocInterface[] = resDocPending.response;

    this.documentosPendientes = await this.setDocument(docsPendings);

    this.isLoading = false;

  }


  async setDocument(docs: GetDocInterface[]): Promise<DocumentoResumenInterface[]> {

    let documentos: DocumentoResumenInterface[] = [];

    //Recorrer la lista oara calcular totales
    for (const doc of docs) {


      //Converitr estructira json str a un objeto JSON
      let estructura: Documento = JSON.parse(doc.estructura);

      if (estructura.Doc_Tipo_Documento == this.facturaService.tipoDocumento) {

        //Totales
        let cargo: number = 0;
        let descuento: number = 0;
        let subtotal: number = 0;
        let total: number = 0;


        //recorrer las transacciones del documento
        estructura.Doc_Transaccion.forEach(tra => {
          //Si no es ni cargo ni desceunto sumar total transaccones
          if (tra.Tra_Cantidad != 0) {
            subtotal += tra.Tra_Monto;
          }

          //sii es cargo sumar cargo
          if (tra.Tra_Cantidad == 0 && tra.Tra_Monto > 0) {
            cargo += tra.Tra_Monto;
          }

          //si es descuento sumar descuento
          if (tra.Tra_Cantidad == 0 && tra.Tra_Monto < 0) {
            descuento += tra.Tra_Monto;
          }
        });


        //calcular total
        total = (subtotal + cargo) + descuento;


        //Agrgar transacion a una interfaz propia

        documentos.push(
          {
            ref_id: estructura.Doc_ID_Documento_Ref!,
            item: doc,
            estructura: estructura,
            cargo: cargo,
            descuento: descuento,
            subtotal: subtotal,
            total: total,
          }
        );


      }
    }

    return documentos;
  }

  //devolver el tipo de trnsaccion correspondiente a un tipo producto
  resolveTipoTransaccion(tipo: number, tiposTransacciones: TipoTransaccionInterface[]): number {

    //recorrer los tipos de transacicion
    for (let i = 0; i < tiposTransacciones.length; i++) {

      const element = tiposTransacciones[i];

      //si el tipo de producto recino coincide con el de un tipo de transaccions 
      if (tipo == element.tipo) {
        //devolver tipo de transaccion
        return element.tipo_Transaccion;
      }

    }

    //Si no se ecnuntra el rtipo de transacicon devuleve 0
    return 0;
  }

  //regresar a modulo de facturacion
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  //ver detalle de un documento
  verDetalle() {

    this.detalleDocumento = true;
    this.historial = false;
  }

  //ver la lista de documntos del hisytorial
  verHistorial() {
    this.detalleDocumento = false;
    this.historial = true;
  }

  //motstrar oantalla de informe de error
  mostrarError(res: ResApiInterface) {

    //Fecha y hora ctual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardra error
    PreferencesService.error = error;

    //mmostrar pantalla de informe de error
    this.verError = true;
  }

  verRecientes() {
    this.recientes = true;
    this.pendientes = false;
    this.facturaService.tipoHistorial = 1;
  }

  verPendientes() {
    this.recientes = false;
    this.pendientes = true;
    this.facturaService.tipoHistorial = 2;
  }


  searchDoc: string = "";
  searchUserDoc: string = PreferencesService.user;

  async buscarDoc() {
    //Vaciar lista de documentos si existen anteriores
    this.documentosRecientes = [];
    this.documentosPendientes = [];

    if (this.recientes) {
      this.isLoading = true;

      const apidocProcess = ()=> this._documentService.getStructureDocProcessed(
        this.user,
        this.token,
        this.searchDoc
      );

      //Obntner ultimos documentos relizados
      let resDocProcessed: ResApiInterface = await ApiService.apiUse(apidocProcess); 

      //si algo salio mal
      if (!resDocProcessed.status) {

        this.isLoading = false;

        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.mostrarError(resDocProcessed);

        return;

      }

      //documentos encontrados
      let docsRecents: GetDocInterface[] = resDocProcessed.response;

      this.documentosRecientes = await this.setDocument(docsRecents);

      this.isLoading = false;
    }

    //PARA DOCUMENTOS PENDIENTES DE MIGRAR

    if (this.pendientes) {

      this.isLoading = true;

      const docPending = ()=> this._documentService.getStructureDosPendigs(
        this.user,
        this.token,
        this.searchUserDoc,
        this.searchDoc,
      );

      //Obntner ultimos documentos relizados
      let resDocPending: ResApiInterface = await ApiService.apiUse(docPending); 

      //si algo salio mal
      if (!resDocPending.status) {

        this.isLoading = false;

        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.mostrarError(resDocPending);

        return;

      }

      //documentos encontrados
      let docsPendings: GetDocInterface[] = resDocPending.response;

      this.documentosPendientes = await this.setDocument(docsPendings);

      this.isLoading = false;

    }

  }


}
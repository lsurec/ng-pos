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
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
  providers: [
    DocumentService,
    TipoTransaccionService,
  ]
})
export class HistorialComponent implements OnInit {

  isLoading: boolean = false; //Pantalla de carga
  historial: boolean = true;   //ver hisytorial
  detalleDocumento: boolean = false; //ver detalle de un docuento
  readonly regresar: number = 5; //id de la pantlla
  verError: boolean = false; // Ver pamtalla informe de errores

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token;   //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo;  //Estacion de la sesion

  documentos: DocumentoResumenInterface[] = []; //documentos del historial
  docSelect!: DocumentoResumenInterface; //documento seleccionado

  constructor(
    //instancias de los servicios necearios
    private _eventService: EventService,
    private _documentService: DocumentService,
    private _tiposTransaccion: TipoTransaccionService,
    private _notificationsServie: NotificationsService,
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
    this.documentos = [];

    this.isLoading = true;

    //Obntner ultimos documentos relizados
    let resDoc = await this._documentService.getDocument(
      this.user,
      this.token,
      0,
    )

    //si algo salio mal
    if (!resDoc.status) {

      this.isLoading = false;

      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resDoc);

      return;

    }

    //documentos encontrados
    let docs: GetDocInterface[] = resDoc.response;

    //Recorrer la lista oara calcular totales
    for (const doc of docs) {

      //Converitr estructira json str a un objeto JSON
      let estructura: Documento = JSON.parse(doc.estructura);

      //Buscar lostipos de transaccion de un documento recuperado
      let resTra = await this._tiposTransaccion.getTipoTransaccion(
        this.user,
        this.token,
        estructura.Doc_Tipo_Documento,
        estructura.Doc_Serie_Documento,
        estructura.Doc_Empresa,
      );

      //Si algo salio mal
      if (!resTra.status) {

        this.isLoading = false;


        let verificador = await this._notificationsServie.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.mostrarError(resTra);

        return;

      }

      //tipos de transaccion del documento
      let tiposTra: TipoTransaccionInterface[] = resTra.response;

      //id tipo transaccion cargo
      let tipoCargo: number = this.resolveTipoTransaccion(4, tiposTra);

      //id tipo transaccion descuento
      let tipoDescuento: number = this.resolveTipoTransaccion(3, tiposTra);

      //Totales
      let cargo: number = 0;
      let descuento: number = 0;
      let subtotal: number = 0;
      let total: number = 0;


      //recorrer las transacciones del documento
      estructura.Doc_Transaccion.forEach(tra => {
        //Si no es ni cargo ni desceunto sumar total transaccones
        if (tra.Tra_Tipo_Transaccion != tipoCargo &&
          tra.Tra_Tipo_Transaccion != tipoDescuento) {
          subtotal += tra.Tra_Monto;
        }

        //sii es cargo sumar cargo
        if (tra.Tra_Tipo_Transaccion == tipoCargo) {
          cargo += tra.Tra_Monto;
        }

        //si es descuento sumar descuento
        if (tra.Tra_Tipo_Transaccion == tipoDescuento) {
          descuento += tra.Tra_Monto;
        }
      });


      //calcular total
      total = (subtotal + cargo) + descuento;

      //Agrgar transacion a una interfaz propia
      this.documentos.push(
        {
          ref_id:estructura.Doc_ID_Documento_Ref!,
          item: doc,
          estructura: estructura,
          cargo: cargo,
          descuento: descuento,
          subtotal: subtotal,
          total: total,
        }
      );

    }

    this.isLoading = false;


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

    this.facturaService.regresarAHistorial = 1;

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
}

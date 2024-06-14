
import { ClienteInterface } from '../interfaces/cliente.interface';
import { DocLocalInterface } from '../interfaces/doc-local.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { Injectable } from '@angular/core';
import { MontoIntreface } from '../interfaces/monto.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PagoComponentService } from './pago-component.service';
import { ParametroInterface } from '../interfaces/parametro.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { SerieInterface } from '../interfaces/serie.interface';
import { TipoTransaccionInterface } from '../interfaces/tipo-transaccion.interface';
import { TraInternaInterface } from '../interfaces/tra-interna.interface';
import { TranslateService } from '@ngx-translate/core';
import { VendedorInterface } from '../interfaces/vendedor.interface';
import { TipoReferenciaInterface } from '../interfaces/tipo-referencia';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { GlobalConvertService } from '../../listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { loadStepInterface } from 'src/app/interfaces/language.interface';
import { FormControl } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class FacturaService {

    idDocumentoRef: number = 0;

    //controlar las vistas de las pestañas
    tabDocummento: boolean = true; //contorlador para la pestaña documento
    tabDetalle: boolean = false;  //controlador para la pestaña de detalle
    tabPago: boolean = false; //Contorlador para la pestaña de pago
    searchText: string = "";  //Texto para bsucar productos
    searchClient: string = ""; //input busqueda cliente
    searchProduct: string = ""; //input busqueda producto
    verError: boolean = false; //ocultar y mostrar pantalla de error
    isLoading: boolean = false; //Pantalla de carga
    isStepLoading: boolean = false; //pantalla de carga de pasos
    tipoDocumento?: number; //Tipo de documento
    documentoName: string = ""; //Descripcion tipo de documento
    series: SerieInterface[] = [] //Series disponibles para un odcumento
    serie?: SerieInterface; //Serie seleccionada
    serieCopy?: SerieInterface; //Serie seleccionada
    vendedores: VendedorInterface[] = []; //vendedores disponibles (cuenta conrrentista ref)
    vendedor?: VendedorInterface; //Vndedor seleccionado (cuenta correntista ref)
    tiposTransaccion: TipoTransaccionInterface[] = []; //Tipos de transaccion disponibles
    parametros: ParametroInterface[] = []; //parametros para el usuario disponobles
    formasPago: FormaPagoInterface[] = []; //formas de pago disponibles
    cuenta?: ClienteInterface; //cuenta seleccionada para el documento 
    buscarcuenta: boolean = true; //mostrar u ocultar lupa de busqueda 

    montos: MontoIntreface[] = []; //Pagos agregados al documento
    traInternas: TraInternaInterface[] = []; //Transacciones agregadas al documento

    selectAllTra: boolean = false; //Seleccionar todas las transacciones

    noMostrar: boolean = false;

    nuevoDoc: boolean = true;

    verDialogoFactura: number = 1;

    //totales del documento
    subtotal: number = 0;
    cargo: number = 0;
    descuento: number = 0;
    total: number = 0;

    //Toales pago
    saldo: number = 0;
    cambio: number = 0;
    pagado: number = 0;


    tiposReferencia: TipoReferenciaInterface[] = [];
    tipoReferencia?: TipoReferenciaInterface;

    fecha?: Date;
    fechaStruct?: NgbDateStruct;

    fechaRefIni?: Date;
    fechaRefFin?: Date;
    fechaIni?: Date;
    fechaFin?: Date;

    copyFechaRefIni?: Date;
    copyFechaRefFin?: Date;
    copyFechaIni?: Date;
    copyFechaFin?: Date;

    refContacto?: string;
    refDescripcion?: string;
    refDireccionEntrega?: string;
    refObservacion?: string;
    refObservaciones?: string; //nueva


    //fechas
    inputFechaIni?: NgbDateStruct; //fecha inicial 
    inputFechaFinal?: NgbDateStruct;
    inputFechaRefIni?: NgbDateStruct;
    inputFechaRefFin?: NgbDateStruct;

    formControlHoraRefIni: FormControl = new FormControl('');
    formControlHoraRefFin: FormControl = new FormControl('');
    formControlHoraIni: FormControl = new FormControl('');
    formControlHoraFin: FormControl = new FormControl('');


    fechaInicialFormat?: string;
    fechaFinalFormat?: string;
    fechaRefInicialFormat?: string;
    fechaRefFinalFormat?: string;



    //observacuion1, observacion del documento
    observacion = ""; //input para agreagar una observacion

    transaccionesPorEliminar: TraInternaInterface[] = [];

    filtrosProductos: number = 1; //filtro producto

    filtroPreferencia: number = 1;
    idFiltroPreferencia: number = 1;




    //estados:1 cargando; 2:correcto; 3:error
    //pasos para pantalla de carga
    pasos: loadStepInterface[] = [
        {
            value: "1. Creando documento.",
            status: 1,
            visible: true,
        },
        {
            value: "2. Generando firma electronica.",
            status: 1,
            visible: true,
        }
    ];

    pasosCompletos: number = 0;
    viewMessage: boolean = false;
    viewError: boolean = false;
    viewErrorFel: boolean = false;
    viewErrorProcess: boolean = false;
    viewSucces: boolean = false;

    stepMessage: string = "";


    constructor(
        //instancias de los servicios utilizados
        private _pagoComponentService: PagoComponentService,
        private _notificationsService: NotificationsService,
        private _translate: TranslateService,
        private _convertService: GlobalConvertService,
    ) {

        if (!PreferencesService.filtroProducto) {
            PreferencesService.filtroProducto = 1;
        }
    }


    setIdDocumentoRef() {
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
        this.idDocumentoRef = parseInt(combinedStr, 10);
    }

    clearData() {
        //limpiar datos del modulo
        this.series = [] //Vaciar series
        this.serie = undefined;  //no seleccionar serie
        this.vendedores = [];  //Vaciar lista cuenta correntista ref
        this.vendedor = undefined; //no seleccionar cuenta correntusta ref
        this.tiposTransaccion = [];  //limpiar tipos de transaccion
        this.parametros = [];  //limpiar parametros
        this.formasPago = [];  //limpiar formas de pago
        this.cuenta = undefined; //no seleccionar cuenta correntista
        this.montos = [];  //limpiar cargo abono agregados al documento
        this.traInternas = []; //limpoiar transaciones agregadas al documento
        this.selectAllTra = false; //No seleccionar todas las transacciones
        this.subtotal = 0; //reniciar subtotla del documento
        this.cargo = 0;  //reiniciar cargos del documento
        this.descuento = 0;  //reiniciar descuentos del documento
        this.total = 0;  //reinicar total del documento
        this.saldo = 0;  //reiniciar saldo por pagar del documento
        this.cambio = 0; //reniciare cambio del documento
        this.pagado = 0; //reinciiar montos oagados del documento
        this.tipoReferencia = undefined;
        this.fechaRefIni = undefined;
        this.fechaRefFin = undefined;
        this.fechaIni = undefined;
        this.fechaFin = undefined;
        this.refContacto = undefined;
        this.refDescripcion = undefined;
        this.refDireccionEntrega = undefined;
        this.refObservacion = undefined;
        this.observacion = "";
        this.searchClient = "";
        this.searchText = "";

    }

    addLeadingZero(number: number): string {
        return number.toString().padStart(2, '0');
    }

    formatstrDateForPriceU(date: Date) {
        return `${date.getFullYear()}${this.addLeadingZero(date.getMonth() + 1)}${this.addLeadingZero(date.getDate())} ${this.addLeadingZero(date.getHours())}:${this.addLeadingZero(date.getMinutes())}:${this.addLeadingZero(date.getSeconds())}`;

    }

    //cargar documento guardado en el strorage
    async loadDocSave(): Promise<boolean> {

        let localDoc = PreferencesService.documento;

        //si no hay un documento guardado no hacer nada
        if (!localDoc) return false;

        //str to object para documento estructura
        let doc: DocLocalInterface = JSON.parse(localDoc);

        //si el tipo docummento guraddao y el actual no coinciden no cargar documento guardado
        if (doc.documento != this.tipoDocumento) return false;

        //si el suario del documento guardado y el usuario de la sesion no coinciden
        if (doc.user.toLocaleLowerCase() != PreferencesService.user.toLocaleLowerCase()) return false;

        //si las empresas son distinitas no cargar el documento
        if (doc.empresa.empresa != PreferencesService.empresa.empresa) return false;

        //si las estaciones son distinitas no cargar el documento
        if (doc.estacion.estacion_Trabajo != doc.estacion.estacion_Trabajo) return false;

        //si el documento guardado no tiene serie  no cargar el documento
        if (!doc.serie) return false;

        //si no hay series cargadas  no cargar el documento
        if (this.series.length == 0) return false;

        //si existe la serie seleccionada por defecto
        if (this.serie) {
            //Si la serie seleccioanda no es la misma que la del documento guardado no cargar el documento
            if (this.serie.serie_Documento != doc.serie.serie_Documento) {
                return false
            } else {
                return true;
            };
        }

        //existe la serie?
        let existSerie: boolean = false;

        //buscar entre las series dicponibles la serie del documento guardado
        for (let i = 0; i < this.series.length; i++) {
            const element = this.series[i];

            //si existe la serie del docuemnto guardado entre las series disponibles
            if (element.serie_Documento == doc.serie.serie_Documento) {
                existSerie = true;
                break;
            }
        }

        //si la serie del docuemnto no existe
        if (!existSerie) return false;

        //si ninguna validacion es falsa se puede recupera el documento guardado
        return true;


    }

    //guardar documento en storage
    saveDocLocal() {


        //Solo se guarda si se está creando
        if (this._convertService.editDoc) return;

        //objeto con todos los datos de un documento
        let doc: DocLocalInterface = {
            user: PreferencesService.user, //usuario de la sesion
            tipoRef: this.valueParametro(58) ? this.tipoReferencia : undefined,
            refFechaEntrega: this.valueParametro(381) ? this.fechaRefIni!.toISOString() : undefined,
            refFechaRecoger: this.valueParametro(382) ? this.fechaRefFin!.toISOString() : undefined,
            refFechaInicio: this.valueParametro(44) ? this.fechaIni!.toISOString() : undefined,
            refFechaFin: this.valueParametro(44) ? this.fechaFin!.toISOString() : undefined,
            refContacto: this.valueParametro(385) ? this.refContacto : undefined,
            refDescripcion: this.valueParametro(383) ? this.refDescripcion : undefined,
            refDireccionEntrega: this.valueParametro(386) ? this.refDireccionEntrega : undefined,
            refObservacion: this.valueParametro(384) ? this.refObservacion : undefined,
            empresa: PreferencesService.empresa, //empresa de la sesion
            estacion: PreferencesService.estacion, //estacion de la sesion
            cliente: this.cuenta, //cliente seleccionado (cuenta correntista)
            vendedor: this.vendedor, //vendedor seleccionado (cuenta correntista ref)
            serie: this.serie, //serie seleccionada
            documento: this.tipoDocumento!, //tipo de documento que se está haciendo
            detalles: this.traInternas, //transacciones agregadas al documento
            pagos: this.montos, //formas de pago (cargo abono) agregadas al documento
        }

        //guardar documento en preferencias
        PreferencesService.documento = JSON.stringify(doc);
    }

    //Buscar tipo transaccion
    resolveTipoTransaccion(tipo: number): number {

        //buscar tipo de trabsaccion dependientdo del tipo de producto
        for (let i = 0; i < this.tiposTransaccion.length; i++) {
            const element = this.tiposTransaccion[i];
            if (tipo == element.tipo) {
                //Devolver tipo de transaccion correspondiente al tipo de producto
                return element.tipo_Transaccion;
            }
        }

        //si no encontró el tipo de producto retorna 0
        return 0;
    }

    //agregar forma de pago
    addMonto(monto: MontoIntreface) {
        //agregar forma de pago
        this.montos.push(monto);

        //calcular pagos
        this.calculateTotalesPago();
    }

    //calcular totales de pago
    calculateTotalesPago() {
        //TOTALES
        this.saldo = 0;
        this.cambio = 0;
        this.pagado = 0;

        //Buscar cuanto se ha pagado en la lista de pagos
        this.montos.forEach(element => {
            this.pagado += element.amount;
        });

        //Buscar cuanto se ha pagado en la lista de pagos
        this.montos.forEach(element => {
            this.pagado += element.difference;
        });

        //calcular y cambio y saldo pendiente de pagar
        if (this.pagado > this.total) {
            this.cambio = this.pagado - this.total;
        } else {
            this.saldo = this.total - this.pagado;
        }

        //Agregar saldo pendiente a la variebale del input monto en pago
        this._pagoComponentService.monto = parseFloat(this.saldo.toFixed(2)).toString();

        //guardar documento en el storage
        this.saveDocLocal();

    }


    //calcular total del documetno
    calculateTotales() {
        //Totales del documento
        this.subtotal = 0;
        this.cargo = 0;
        this.descuento = 0;
        this.total = 0;

        //Recorrer todas las transacciones par calcular cargos y descuentos
        this.traInternas.forEach(element => {

            //calcular los cargos y descuentos de la transaccion
            element.cargo = 0;
            element.descuento = 0;

            //buscar cargos y descuentos
            element.operaciones.forEach(tra => {

                //calcular los cargos y descuentos
                element.cargo += tra.cargo;
                element.descuento += tra.descuento;

            });
        });

        //Recorrer todas las transacciones par calcular subtotal del documento
        this.traInternas.forEach(element => {
            //Calcular totales
            this.subtotal += element.total;
            this.cargo += element.cargo;
            this.descuento += element.descuento;
        });


        //calcular gran total en base a cargos, descuntos y subtotal
        this.total = this.cargo + this.descuento + this.subtotal;

        //clacluar totales en los pagos
        this.calculateTotalesPago();

    }

    //agregar transaccion al docummento
    addTransaction(transaccion: TraInternaInterface) {

        //agregar a la transaccion el estado del checkboz para seleccionar trnbsacciones
        transaccion.isChecked = this.selectAllTra;

        //Agregar transaccion
        this.traInternas.push(transaccion);
        
        this.searchProduct = "";

        //calcluar totales
        this.calculateTotales();
    }


    getTextParam(param: number): string | null {

        //57:Cuenta

        //texto por defecto
        let name: string | null = null;

        //recorrer lista de parametros
        for (let i = 0; i < this.parametros.length; i++) {
            const parametro = this.parametros[i];

            //buscar el nombre en el parametro 57
            if (parametro.parametro == param) {
                // si nombre es nulo agregar el texto por defecto
                name = parametro.pa_Caracter;
                break;
            }

        }

        //retornar texto
        return name;
    }


    valueParametro(parametro: number): boolean {
        // 44: Fecha ini y fehca fin
        // 58: detalles del evento, info
        // 349:FEL
        // 351:Editar precios
        // 381: Fecha entrega, contacto, direccion de entrega
        // 382: Fecha recoger
        // 383: descripcion
        // 384: Observacion


        //El parametro existe
        let value: boolean = false;

        //recorrer todos los parametros disponibles
        for (let i = 0; i < this.parametros.length; i++) {
            const element = this.parametros[i];

            //Se busca el parametro
            if (element.parametro == parametro) {
                //Sí es permitido el proceso fel
                value = true;
                break;
            }
        }

        //Retornar true o false
        return value;
    }

}

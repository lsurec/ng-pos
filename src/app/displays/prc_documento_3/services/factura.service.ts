
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

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class FacturaService {

    searchClient: string = ""; //input busqueda cliente
    searchProduct: string = ""; //input busqueda producto

    isLoading: boolean = false; //Pantalla de carga
    tipoDocumento?: number; //Tipo de documento
    documentoName: string = ""; //Descripcion tipo de documento
    series: SerieInterface[] = [] //Series disponibles para un odcumento
    serie?: SerieInterface; //Serie seleccionada
    vendedores: VendedorInterface[] = []; //vendedores disponibles (cuenta conrrentista ref)
    vendedor?: VendedorInterface; //Vndedor seleccionado (cuenta correntista ref)
    tiposTransaccion: TipoTransaccionInterface[] = []; //Tipos de transaccion disponibles
    parametros: ParametroInterface[] = []; //parametros para el usuario disponobles
    formasPago: FormaPagoInterface[] = []; //formas de pago disponibles
    cuenta?: ClienteInterface; //cuenta seleccionada para el documento 

    montos: MontoIntreface[] = []; //Pagos agregados al documento
    traInternas: TraInternaInterface[] = []; //Transacciones agregadas al documento

    selectAllTra: boolean = false; //Seleccionar todas las transacciones

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

    //tipo cliente
    tipoCliente?: TipoReferenciaInterface;

    fecha: Date = new Date();


    fechaEntrega?: Date;
    fechaRecoger?: Date;
    fechaIni?: Date;
    fechaFin?: Date;

    refContacto?: string;
    refDescripcion?: string;
    refDireccionEntrega?: string;
    refObservacion?: string;


    //fechas
    inputFechaInicial?: NgbDateStruct; //fecha inicial 
    inputFechaFinal?: NgbDateStruct;
    inputFechaEntrega?: NgbDateStruct;
    inputFechaRecoger?: NgbDateStruct;

    //horas
    horaIncial!: string; //hora actual
    horaFinal!: string //hora final +10 min
    horaEntrega!: string;
    horaRecoger!: string;

    constructor(
        //instancias de los servicios utilizados
        private _pagoComponentService: PagoComponentService,
        private _notificationsService: NotificationsService,
        private _translate: TranslateService,
    ) { }




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
        this.fechaEntrega = undefined;
        this.fechaRecoger = undefined;
        this.fechaIni = undefined;
        this.fechaFin = undefined;
        this.refContacto = undefined;
        this.refDescripcion = undefined;
        this.refDireccionEntrega = undefined;
        this.refObservacion = undefined;

    }

    addLeadingZero(number: number): string {
        return number.toString().padStart(2, '0');
    }


    formatstrDateForPriceU(date: Date) {
        return `${date.getFullYear()}${this.addLeadingZero(date.getMonth() + 1)}${this.addLeadingZero(date.getDate())} ${this.addLeadingZero(date.getHours())}:${this.addLeadingZero(date.getMinutes())}:${this.addLeadingZero(date.getSeconds())}`;

    }

    //cargar documento guardado en el strorage
    async loadDocDave() {

        let localDoc = PreferencesService.documento;

        //si no hay un documento guardado no hacer nada
        if (!localDoc) {
            return;
        }

        //str to object para documento estructura
        let doc: DocLocalInterface = JSON.parse(localDoc);

        //si el tipo docummento guraddao y el actual no coinciden no cargar documento guardado
        if (doc.documento != this.tipoDocumento) {
            return;
        }

        //si el suario del documento guardado y el usuario de la sesion no coinciden
        if (doc.user.toLocaleLowerCase() != PreferencesService.user.toLocaleLowerCase()) {
            return;
        }

        //si las empresas son distinitas no cargar el documento
        if (doc.empresa.empresa != PreferencesService.empresa.empresa) {
            return;
        }

        //si las estaciones son distinitas no cargar el documento
        if (doc.estacion.estacion_Trabajo != doc.estacion.estacion_Trabajo) {
            return;
        }

        //validar serie solo si existe en el documento guardado
        if (doc.serie) {


            //evaluar series de la sesion si existen
            if (this.series.length > 0) {
                //si ya hay una serie seleccionada validar que sea la misma del documento
                if (this.serie) {
                    //si las series son distinitas no hacer nada
                    if (this.serie.serie_Documento != doc.serie.serie_Documento) {
                        return;
                    }


                }

                //Existe la serie?
                let existSerie: boolean = false;

                //si no hay serie seleccionada bucsar la serie guardada en las series disponibles
                for (let i = 0; i < this.series.length; i++) {
                    //serie de la iteracion
                    const element = this.series[i];
                    //si se encunetra la serie guardada se puede asignar al documento
                    if (element.serie_Documento == doc.serie.serie_Documento) {
                        //la bodega existe
                        existSerie = true;
                        break;
                    }
                }

                //si la serie no existe no cargar el documento guardado
                if (!existSerie) {
                    return;
                }
            } else {
                //si no hay series no cargar el documento guardado
                return;
            }


        }

        //Dialogo para cargar documento guardado
        let verificador = await this._notificationsService.openDialogActions(
            {
                title: this._translate.instant('pos.alertas.docEncontrado'),
                description: this._translate.instant('pos.alertas.recuperar'),
            }
        );

        if (!verificador) return;


        //Cargar documento

        //buscar serie guardada en las series disponobles
        if (doc.serie) {
            for (let i = 0; i < this.series.length; i++) {

                const element = this.series[i];

                //Asignar serie guardada
                if (element.serie_Documento == doc.serie.serie_Documento) {
                    this.serie = element;
                    break;
                }

            }

        }


        //Buscar vendedor asigando en el documento guardado
        if (doc.vendedor) {

            for (let i = 0; i < this.vendedores.length; i++) {
                const element = this.vendedores[i];

                //Asignaer vendedor guardado
                if (element.cuenta_Correntista == doc.vendedor?.cuenta_Correntista) {
                    this.vendedor = element;
                }
            }
        }


        this.cuenta = doc.cliente; //asignar cliente
        this.traInternas = doc.detalles; //asignar detalles
        this.montos = doc.pagos; //asignar pagos

        //TODO:Verificar
        this.tipoReferencia = doc.tipoRef;



        //load dates 
        this.fechaEntrega = new Date(doc.refFechaEntrega!);
        this.fechaRecoger = new Date(doc.refFechaRecoger!);
        this.fechaIni = new Date(doc.refFechaInicio!);
        this.fechaFin = new Date(doc.refFechaFin!);


        //set dates in inputs
        this.inputFechaEntrega = {
            year: this.fechaEntrega.getFullYear(),
            day: this.fechaEntrega.getDate(),
            month: this.fechaEntrega.getMonth() + 1,
        }

        this.inputFechaRecoger = {
            year: this.fechaRecoger.getFullYear(),
            day: this.fechaRecoger.getDate(),
            month: this.fechaRecoger.getMonth() + 1,
        }

        this.inputFechaInicial = {
            year: this.fechaIni.getFullYear(),
            day: this.fechaIni.getDate(),
            month: this.fechaIni.getMonth() + 1,
        }

        this.inputFechaFinal = {
            year: this.fechaFin.getFullYear(),
            day: this.fechaFin.getDate(),
            month: this.fechaFin.getMonth() + 1,
        }

        //set time
        this.horaIncial = UtilitiesService.getHoraInput(this.fechaIni);
        this.horaFinal = UtilitiesService.getHoraInput(this.fechaFin);
        this.horaEntrega = UtilitiesService.getHoraInput(this.fechaEntrega);
        this.horaRecoger = UtilitiesService.getHoraInput(this.fechaRecoger);


        // set observaciones
        this.refContacto = doc.refContacto;
        this.refDescripcion = doc.refDescripcion;
        this.refDireccionEntrega = doc.refDireccionEntrega;
        this.refObservacion = doc.refObservacion;


        //calcular totales del documento y pagos
        this.calculateTotales();

    }

    //guardar documento en storage
    saveDocLocal() {
        //objeto con todos los datos de un documento
        let doc: DocLocalInterface = {
            user: PreferencesService.user, //usuario de la sesion
            tipoRef: this.valueParametro(58) ? this.tipoReferencia : undefined,
            refFechaEntrega: this.valueParametro(381) ? this.fechaEntrega!.toISOString() : undefined,
            refFechaRecoger: this.valueParametro(382) ? this.fechaRecoger!.toISOString() : undefined,
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

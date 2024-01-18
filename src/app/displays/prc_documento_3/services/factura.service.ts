
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

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class FacturaService {


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

    constructor(
        //instancias de los servicios utilizados
        private _pagoComponentService: PagoComponentService,
        private _notificationsService: NotificationsService,
        private _translate: TranslateService,
    ) { }


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
                //TODO:Translate
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


        //calcular totales del documento y pagos
        this.calculateTotales();

    }

    //guardar documento en storage
    saveDocLocal() {
        //objeto con todos los datos de un documento
        let doc: DocLocalInterface = {
            user: PreferencesService.user, //usuario de la sesion
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

        return 0;
    }


    addMonto(monto: MontoIntreface) {
        this.montos.push(monto);
        this.calculateTotalesPago();
    }

    calculateTotalesPago() {
        this.saldo = 0;
        this.cambio = 0;
        this.pagado = 0;

        this.montos.forEach(element => {
            this.pagado += element.amount;
        });

        this.montos.forEach(element => {
            this.pagado += element.difference;
        });

        //calcular y cambio y saldo pendiente de pagar
        if (this.pagado > this.total) {
            this.cambio = this.pagado - this.total;
        } else {
            this.saldo = this.total - this.pagado;
        }

        this._pagoComponentService.monto = parseFloat(this.saldo.toFixed(2)).toString();



        this.saveDocLocal();

    }



    calculateTotales() {
        this.subtotal = 0;
        this.cargo = 0;
        this.descuento = 0;
        this.total = 0;

        this.traInternas.forEach(element => {
            element.cargo = 0;
            element.descuento = 0;

            element.operaciones.forEach(tra => {
                element.cargo += tra.cargo;
                element.descuento += tra.descuento;

            });
        });


        this.traInternas.forEach(element => {
            this.subtotal += element.total;
            this.cargo += element.cargo;
            this.descuento += element.descuento;
        });


        this.total = this.cargo + this.descuento + this.subtotal;

        this.calculateTotalesPago();

    }

    addTransaction(transaccion: TraInternaInterface) {
        transaccion.isChecked = this.selectAllTra;
        this.traInternas.push(transaccion);
        this.calculateTotales();
    }

    getTextCuenta(): string {
        let name: string = "Cuenta";

        for (let i = 0; i < this.parametros.length; i++) {
            const parametro = this.parametros[i];

            //buscar el nombre en el parametro 57
            if (parametro.parametro == 57) {
                name = parametro.pa_Caracter ?? "Cuenta";
                break;
            }

        }

        return name;

    }

    editPrice(): boolean {
        let edit: boolean = false;

        for (let i = 0; i < this.parametros.length; i++) {
            const param = this.parametros[i];

            //buscar parametro para editar el precio (351)
            if (param.parametro == 351) {
                edit = true;
                break;
            }
        }

        return edit;
    }

    //Proceso fel
    printFel(): boolean {

        let fel: boolean = false;

        for (let i = 0; i < this.parametros.length; i++) {
            const element = this.parametros[i];
            //el parametro que indica si genera fel o no es 349

            if (element.parametro == 349) {
                fel = true;
                break;
            }
        }


        return fel;
    }


}

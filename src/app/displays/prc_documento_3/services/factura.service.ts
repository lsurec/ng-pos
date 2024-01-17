
import { Injectable } from '@angular/core';
import { SerieInterface } from '../interfaces/serie.interface';
import { VendedorInterface } from '../interfaces/vendedor.interface';
import { TipoTransaccionInterface } from '../interfaces/tipo-transaccion.interface';
import { ParametroInterface } from '../interfaces/parametro.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { ClienteInterface } from '../interfaces/cliente.interface';
import { TraInternaInterface } from '../interfaces/tra-interna.interface';
import { MontoIntreface } from '../interfaces/monto.interface';
import { PagoComponentService } from './pogo-component.service';
import { DocLocalInterface } from '../interfaces/doc-local.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class FacturaService {


    isLoading: boolean = false;
    tipoDocumento?: number;
    documentoName: string = "";
    series: SerieInterface[] = []
    serie?: SerieInterface;
    vendedores: VendedorInterface[] = [];
    vendedor?: VendedorInterface;
    tiposTransaccion: TipoTransaccionInterface[] = [];
    parametros: ParametroInterface[] = [];
    formasPago: FormaPagoInterface[] = [];
    cuenta?: ClienteInterface;

    montos: MontoIntreface[] = [];
    traInternas: TraInternaInterface[] = [];

    //Seleccionar todas las transacciones
    selectAllTra: boolean = false;


    //totales del documento
    //Reiniciar valores
    subtotal: number = 0;
    cargo: number = 0;
    descuento: number = 0;
    total: number = 0;


    //Toales pago
    saldo: number = 0;
    cambio: number = 0;
    pagado: number = 0;


    constructor(
        private _pagoComponentService: PagoComponentService,
        private _notificationsService: NotificationsService,
        private _translate: TranslateService,
    ) { }


    async loadDocDave() {

        let localDoc = PreferencesService.documento;

        //si no hay un documento guardado no hacer nada
        if (!localDoc) {
            return;
        }

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

                let existSerie: boolean = false;

                //si no hay serie seleccionada bucsar la serie guardada en las series disponibles
                for (let i = 0; i < this.series.length; i++) {
                    //serie de la iteracion
                    const element = this.series[i];
                    //si se encunetra la serie guardada se puede asignar al documento
                    if (element.serie_Documento == doc.serie.serie_Documento) {
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

        if (doc.serie) {
            for (let i = 0; i < this.series.length; i++) {
                const element = this.series[i];

                if (element.serie_Documento == doc.serie.serie_Documento) {
                    this.serie = element;
                    break;
                }

            }

        }

        

        if (doc.vendedor) {
            
            for (let i = 0; i < this.vendedores.length; i++) {
                const element = this.vendedores[i];
                if (element.cuenta_Correntista == doc.vendedor?.cuenta_Correntista) {
                    this.vendedor = element;
                }
            }
        }




        this.cuenta = doc.cliente;
        this.traInternas = doc.detalles;
        this.montos = doc.pagos;

        this.calculateTotales();


    }


    saveDocLocal() {
        let doc: DocLocalInterface = {
            user: PreferencesService.user,
            empresa: PreferencesService.empresa,
            estacion: PreferencesService.estacion,
            cliente: this.cuenta,
            vendedor: this.vendedor,
            serie: this.serie,
            documento: this.tipoDocumento!,
            detalles: this.traInternas,
            pagos: this.montos,
        }

        PreferencesService.documento = JSON.stringify(doc);
    }


    resolveTipoTransaccion(tipo: number): number {

        for (let i = 0; i < this.tiposTransaccion.length; i++) {
            const element = this.tiposTransaccion[i];
            if (tipo == element.tipo) {
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

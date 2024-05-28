import { DialogActionInterface } from "../interfaces/dialog-actions.interface";
import { DialogActionsComponent } from "../components/dialog-actions/dialog-actions.component";
import { ErrorInterface } from "../interfaces/error.interface";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PreferencesService } from "./preferences.service";
import { ResApiInterface } from "../interfaces/res-api.interface";
import { RouteNamesService } from "./route.names.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ValidateProductInterface } from "../displays/listado_Documento_Pendiente_Convertir/interfaces/validate-product.interface";
import { ProductoInterface } from "../displays/prc_documento_3/interfaces/producto.interface";
import { ProductoComponent } from "../displays/prc_documento_3/components/producto/producto.component";
import { InformeProductosComponent } from "../displays/prc_documento_3/components/informe-productos/informe-productos.component";
import { ConfirmarNuevoDocComponent } from "../components/confirmar-nuevo-doc/confirmar-nuevo-doc.component";

@Injectable({
    providedIn: 'root'
})


//serivicio para notificaciones en cul quir parte del proyecto
export class NotificationsService {

    //Inicializar snack
    constructor(
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
        private _translate: TranslateService,
        private _router: Router,

    ) {
    }

    //Abrir o mostar  snackbar
    openSnackbar(message: string) {
        this._snackBar.open(message, this._translate.instant('pos.alertas.ok'), { duration: 5 * 1000 })
    }

    openSnackbarAction(
        message: string,
        action: string,
        funcion: Function,
    ) {
        let snackBarRef = this._snackBar.open(message, action, { duration: 5000 });

        snackBarRef.onAction().subscribe(() => {
            funcion();
        });
    }



    //Abrir dialogo de confirmacion, devuelve falso o verdadero dependiendo de la opcion seleccioanda
    openDialogActions(data: DialogActionInterface): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialogRef = this._dialog.open(DialogActionsComponent, {
                data: {
                    title: data.title,
                    description: data.description,
                    verdadero: data.verdadero,
                    falso: data.falso
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }


    //Abrir dialogo de confirmacion, devuelve falso o verdadero dependiendo de la opcion seleccioanda
    openDialogNewDoc(data: DialogActionInterface): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialogRef = this._dialog.open(ConfirmarNuevoDocComponent, {
                data: {
                    title: data.title,
                    description: data.description,
                    verdadero: data.verdadero,
                    falso: data.falso
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }


    openDialogValidations(mensajes: ValidateProductInterface[]): Promise<any> {
        return new Promise((resolve, reject) => {

            const dialogRef = this._dialog.open(InformeProductosComponent, {
                data: mensajes,
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    resolve(result);
                } else {
                    resolve(result);
                }
            });
        });
    }



    openDetalleporoduct(productTra: ProductoInterface): Promise<any> {
        return new Promise((resolve, reject) => {

            const dialogRef = this._dialog.open(ProductoComponent, { data: productTra })


            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    resolve(result);
                } else {
                    resolve(result);
                }
            });
        });
    }

    //Muestra mmensaje de eror, y navega a  pantalla de informe de errores
    async showErrorAlert(res: ResApiInterface) {
        let verificador = await this.openDialogActions(
            {
                title: this._translate.instant('pos.alertas.salioMal'),
                description: this._translate.instant('pos.alertas.error'),
                verdadero: this._translate.instant('pos.botones.informe'),
                falso: this._translate.instant('pos.botones.aceptar'),
            }
        );

        if (!verificador) return;


        //si la opcion seleccioanda es "ver informe"
        let dateNow: Date = new Date();

        let error: ErrorInterface = {
            date: dateNow,
            description: res.response,
            storeProcedure: res.storeProcedure,
            url: res.url,

        }

        PreferencesService.error = error;

        //navhegar a pantalla para ver el informe de error
        this._router.navigate([RouteNamesService.ERROR]);

    }

    //dialogo para cerrar sesion
    async showCloseSesionDialog() {
        let verificador: boolean = await this.openDialogActions(
            {
                title: this._translate.instant('pos.alertas.tituloCerrar'),
                description: this._translate.instant('pos.alertas.borraranDatos'),
                verdadero: this._translate.instant('pos.botones.aceptar'),
                falso: this._translate.instant('pos.botones.cancelar'),
            }
        );

        if (!verificador) return;

        //limpiar datos de la sesion
        PreferencesService.closeSession();

        //Regresar a Login
        this._router.navigate([RouteNamesService.LOGIN]);
    }


}

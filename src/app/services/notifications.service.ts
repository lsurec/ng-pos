import { Injectable } from "@angular/core";
import { DialogActionInterface } from "../interfaces/dialog-actions";
import { DialogActionsComponent } from "../components/dialog-actions/dialog-actions.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { ErrorInterface } from "../interfaces/error.interface";
import { PreferencesService } from "./preferences.service";
import { RouteNamesService } from "./route.names.service";
import { Router } from "@angular/router";
import { ResApiInterface } from "../interfaces/res-api.interface";

@Injectable({
    providedIn: 'root'
})

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



    //Abrir dialogo antes de cerrar sesion o salir
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

    async showErrorAlert(res: ResApiInterface) {
        let verificador = await this.openDialogActions(
            {
                title: this._translate.instant('pos.alertas.salioMal'),
                description: this._translate.instant('pos.alertas.error'),
                verdadero:  this._translate.instant('pos.botones.aceptar'),
                falso: this._translate.instant('pos.botones.informe'),
            }
        );

        if (verificador) return;


        let dateNow: Date = new Date();

        let error: ErrorInterface = {
            date: dateNow,
            description: res.response,
            storeProcedure: res.storeProcedure,
            url: res.url,

        }

        PreferencesService.error = error;
        this._router.navigate([RouteNamesService.ERROR]);

    }

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

        PreferencesService.closeSession();

        //Regresar a Login
        this._router.navigate([RouteNamesService.LOGIN]);
    }


}

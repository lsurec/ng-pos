import { Injectable } from "@angular/core";
import { DialogActionInterface } from "../interfaces/dialog-actions";
import { DialogActionsComponent } from "../components/dialog-actions/dialog-actions.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class WidgetsService {

    //Inicializar snack
    constructor(private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
    ) {
    }

    //Abrir o mostar  snackbar
    openSnackbar(message: string, action: string) {
        this._snackBar.open(message, action, { duration: 5 * 1000 })
    }

    openSnackbarID(message: string, action: string) {
        this._snackBar.open(message, action, { duration: 15 * 1000 })
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

}

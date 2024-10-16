import { Component, Inject } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormatoComandaInterface } from '../../interfaces/data-comanda.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { NotificationsService } from 'src/app/services/notifications.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-error-comanda',
  templateUrl: './error-comanda.component.html',
  styleUrls: ['./error-comanda.component.scss'],
  providers: [PrinterService]
})
export class ErrorComandaComponent {


  isLoading: boolean = false;
  error: string = "No se pudo imprimir";

  erroresComanda: FormatoComandaInterface[] = [];

  constructor(
    public restaurantService: GlobalRestaurantService,
    public dialogRef: MatDialogRef<ErrorComandaComponent>,
    @Inject(MAT_DIALOG_DATA) public errorComanda: FormatoComandaInterface[],
    private _printService: PrinterService,
    private _translate: TranslateService,
    private _notificationService: NotificationsService,

  ) {
    this.erroresComanda = errorComanda;

  }


  closeDialog() {
    this.dialogRef.close();
  }


  async printAgain(indexFormat: number) {


    this.restaurantService.isLoading = true;


    this.erroresComanda[indexFormat].error = "";

    const docDefinition = await this._printService.getComandaTMU(this.erroresComanda[indexFormat]);

    let resService: ResApiInterface = await this._printService.getStatus();

    if (!resService.status) {
      this.erroresComanda[indexFormat].error = this._translate.instant('pos.alertas.sin_servicio_impresion');
    }

    if (!this.erroresComanda[indexFormat].error) {



      let resPrintStatus: ResApiInterface = await this._printService.getStatusPrint(this.erroresComanda[indexFormat].ipAdress);

      if (!resPrintStatus.status) {
        this.erroresComanda[indexFormat].error = `${this._translate.instant('pos.factura.impresora')} ${this.erroresComanda[indexFormat].ipAdress} ${this._translate.instant('pos.factura.noDisponible')}.`;
      }


      if (!this.erroresComanda[indexFormat].error) {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.pdfMake.vfs);

        console.log(this.erroresComanda[indexFormat]);

        // return;

        const blob = await UtilitiesService.generatePdfBlob(pdfDocGenerator);

        var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

        let resPrint: ResApiInterface = await this._printService.postPrint(
          pdfFile,
          this.erroresComanda[indexFormat].ipAdress,
          "1",
        );


        if (!resPrint.status) {

          this.erroresComanda[indexFormat].error = "Fallo al imprimir";

        }


      }

    }


    this.restaurantService.isLoading = false;

    if (this.erroresComanda[indexFormat].error) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.algoSalioMal'));
      return;
    } else {
      //eliniinar un elento de la lista
      this.erroresComanda.splice(indexFormat, 1);


      if (this.erroresComanda.length == 0) {
        this.closeDialog();
      }

    }

  }





  async printAnyway(index: number) {
    this.restaurantService.isLoading = true;

    const doc = await this._printService.getComandaTMU(this.erroresComanda[index]);
    pdfMake.createPdf(doc, undefined, undefined, pdfFonts.pdfMake.vfs).open();

    this.restaurantService.isLoading = false;


    this._notificationService.openSnackbar("Comanda enviada"); //TODO:Translate

    //eliniinar un elento de la lista
    this.erroresComanda.splice(index, 1);


    if (this.erroresComanda.length == 0) {
      this.closeDialog();
    }


  }

  async printAllAnyway() {

    this.restaurantService.isLoading = true;

    for (const element of this.erroresComanda) {

      const doc = await this._printService.getComandaTMU(element);
      pdfMake.createPdf(doc, undefined, undefined, pdfFonts.pdfMake.vfs).print();

      this.closeDialog();

      this._notificationService.openSnackbar("Comanda enviada"); //TODO:Translate




    }

    this.restaurantService.isLoading = false;

  }

  async printAllAgain() {
    this.restaurantService.isLoading = true;

    //Imprimir formatos
    for (const format of this.erroresComanda) {

      format.error = "";

      const docDefinition = await this._printService.getComandaTMU(format);

      let resService: ResApiInterface = await this._printService.getStatus();

      if (!resService.status) {
        format.error = this._translate.instant('pos.alertas.sin_servicio_impresion');
      }

      if (!format.error) {

        let resPrintStatus: ResApiInterface = await this._printService.getStatusPrint(format.ipAdress);

        if (!resPrintStatus.status) {
          format.error = `${this._translate.instant('pos.factura.impresora')} ${format.ipAdress} ${this._translate.instant('pos.factura.noDisponible')}.`;
        }


        if (!format.error) {
          const pdfDocGenerator = pdfMake.createPdf(docDefinition, undefined, undefined, pdfFonts.pdfMake.vfs);

          // return;

          const blob = await UtilitiesService.generatePdfBlob(pdfDocGenerator);


          // ...
          var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

          let resPrint: ResApiInterface = await this._printService.postPrint(
            pdfFile,
            format.ipAdress,
            "1",
          );


          if (!resPrint.status) {

            format.error = "Fallo al imprimir";
            console.error(resPrint.response);

          }


        }

      }


    }

    this.restaurantService.isLoading = false;

    // Filtrar los elementos que tienen algo en la propiedad 'error'
    const comandasConError = this.erroresComanda.filter(comanda => comanda.error !== '');

    if (comandasConError.length > 0) {
      this._notificationService.openSnackbar("Algo salió mal"); //TODO:Translate

      return;

    } else {

      this._notificationService.openSnackbar("Comanda enviada"); //TODO:Translate
      this.closeDialog();

    }
  }

}

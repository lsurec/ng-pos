import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-details-dest-docs',
  templateUrl: './details-dest-docs.component.html',
  styleUrls: ['./details-dest-docs.component.scss']
})
export class DetailsDestDocsComponent {

  
  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  
  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _receptionService:ReceptionService,

  ) {

  }


  async loadOrigin() {

    this.globalConvertSrevice.docsOrigin = [];


    let res: ResApiInterface = await this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaInicial!),
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaFinal!),
    );


    if (!res.status) {
      this.globalConvertSrevice.isLoading = false;

      // this.showError(res);

      return;

    }

    this.globalConvertSrevice.docsOrigin = res.response;
  }


}

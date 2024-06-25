import { Component } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-barra-logos',
  templateUrl: './barra-logos.component.html',
  styleUrls: ['./barra-logos.component.scss']
})
export class BarraLogosComponent {

  verLogo: boolean = false;
  empresaImg?: string;


  constructor() {

    if (PreferencesService.imgEmpresa) {

      PreferencesService.imgEmpresa = PreferencesService.empresa.empresa_Img;
      this.empresaImg = "data:image/png;base64," + PreferencesService.imgEmpresa;
      this.verLogo = true;
    }

  }

}

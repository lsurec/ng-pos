import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-barra-logos',
  templateUrl: './barra-logos.component.html',
  styleUrls: ['./barra-logos.component.scss']
})
export class BarraLogosComponent implements OnInit {

  empresaImg: string = "";

  constructor() {
  }

  ngOnInit(): void {
    if (PreferencesService.empresa.empresa_Img) {
      this.empresaImg = "data:image/png;base64," + PreferencesService.empresa.empresa_Img;
    }
  }


}

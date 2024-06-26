import { Component, OnInit } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ErrorService } from 'src/app/services/error.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-registro-de-errores',
  templateUrl: './registro-de-errores.component.html',
  styleUrls: ['./registro-de-errores.component.scss'],
  providers: [
    ErrorService,
  ]
})
export class RegistroDeErroresComponent implements OnInit {

  isLoading: boolean = false;
  token: string = PreferencesService.token;


  constructor(
    private _errorService: ErrorService,

  ) {

  }


  ngOnInit(): void {
    this.laodData();
  }

  async laodData() {
    this.isLoading = true;


    let resApi: ResApiInterface = await this._errorService.getError(this.token);

    console.log(resApi);



    this.isLoading = false;
  }




}

import { Component } from '@angular/core';
import { HelloService } from './services/hello.service';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from './services/preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(
    private translate: TranslateService
  ) {
    // localStorage.clear();
    // sessionStorage.clear();
    
    if(PreferencesService.lang){
         this.translate.use(PreferencesService.lang);
      }else{
        translate.use("es")
        
      }
  }

  // public cambiarLenguaje(lang: any) {
  //   this.activeLang = lang;
  // }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ApiComponent } from './components/api/api.component';
import { LoginComponent } from './components/login/login.component';
import { SplashComponent } from './components/splash/splash.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import { HelpComponent } from './components/help/help.component';
import { ErrorComponent } from './components/error/error.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DialogActionsComponent } from './components/dialog-actions/dialog-actions.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { LogosComponent } from './components/logos/logos.component';
import { ProgressComponent } from './components/progress/progress.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BarraLogosComponent } from './components/barra-logos/barra-logos.component';
import { BarraLogoDemosoftComponent } from './components/barra-logo-demosoft/barra-logo-demosoft.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LenguajeAplicacionComponent } from './components/lenguaje-aplicacion/lenguaje-aplicacion.component';
import { TemaAplicacionComponent } from './components/tema-aplicacion/tema-aplicacion.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { LocalConfigComponent } from './components/local-config/local-config.component';

import { routing } from './app.routing';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    ApiComponent,
    LoginComponent,
    SplashComponent,
    NotFoundComponent,
    HomeComponent,
    HelpComponent,
    ErrorComponent,
    DialogActionsComponent,
    LogosComponent,
    ProgressComponent,
    BarraLogosComponent,
    BarraLogoDemosoftComponent,
    LenguajeAplicacionComponent,
    TemaAplicacionComponent,
    LocalConfigComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http);
        },
        deps: [HttpClient]
      }
    }),
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    MatRadioModule,
    routing,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { RouterModule } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { HomeComponent } from "./components/home/home.component";
import { LocalConfigComponent } from "./components/local-config/local-config.component";
import { LoginGuard } from "./guards/login.guard";
import { HomeGuard } from "./guards/home.guard";
import { SplashComponent } from "./components/splash/splash.component";
import { RouteNamesService } from "./services/route.names.service";
import { LangComponent } from "./components/lang/lang.component";
import { ThemeComponent } from "./components/theme/theme.component";
import { ApiComponent } from "./components/api/api.component";

type PathMatch = "full" | "prefix" | undefined;

const appRoutes = [

    { path: RouteNamesService.SPLASH, component: SplashComponent},
    { path: RouteNamesService.LANGUAGE, component: LangComponent},
    { path: RouteNamesService.THEME, component: ThemeComponent},
    { path: RouteNamesService.API, component: ApiComponent},
    { path: RouteNamesService.LOCAL_CONFIG, component: LocalConfigComponent},
    { path: RouteNamesService.NOT_FOUND, component: NotFoundComponent},
    { path: RouteNamesService.HOME, component: HomeComponent},


    { path: RouteNamesService.LOGIN, component: LoginComponent, canActivate: [LoginGuard] },
    // { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    // { path: 'home', component: HomeComponent, canActivate: [HomeGuard] },
    // { path: '**', redirectTo: '/notFound', pathMatch: 'full' as PathMatch },
    { path: '', redirectTo: RouteNamesService.SPLASH, pathMatch: 'full' as PathMatch },

]

export const routing = RouterModule.forRoot(appRoutes)

import { RouterModule } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { HomeComponent } from "./components/home/home.component";
import { LocalConfigComponent } from "./components/local-config/local-config.component";
import { LoginGuard } from "./guards/login.guard";
import { HomeGuard } from "./guards/home.guard";

type PathMatch = "full" | "prefix" | undefined;

const appRoutes = [
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'home', component: HomeComponent, canActivate: [HomeGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' as PathMatch },
    { path: '**', redirectTo: '/login', pathMatch: 'full' as PathMatch },
    { path: 'notFound', component: NotFoundComponent },
    { path: 'station', component: LocalConfigComponent },

]

export const routing = RouterModule.forRoot(appRoutes)

import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    const response: ResponseInterface = event.body;
                    const resApi: ResApiInterface = {
                        status:true,
                        response: response.data,
                        storeProcedure: response.storeProcedure,
                        url: req.url
                    };
                    // Replace the original response with the structured response
                    return event.clone({ body: resApi });
                }
                return event;
            }),
            catchError((err: HttpErrorResponse) => {
              let resApi: ResApiInterface;
              if (err.error && err.error.storeProcedure) {
                  const response: ResponseInterface = <ResponseInterface>err.error;
          
                  resApi = {
                      status: false,
                      response: response.data,
                      storeProcedure: response.storeProcedure,
                      url: err.url ?? "",
                  };
              } else {
                  resApi = {
                      status: false,
                      response: err,
                      url: err.url ?? "",
                  };
              }
              return throwError(resApi);
          })
        );
    }
}

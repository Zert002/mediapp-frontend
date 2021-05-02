import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Signo } from '../_model/signo';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class SignoService extends GenericService<Signo> {

  private signoCambio = new Subject<Signo[]>();
  private mensajeCambio = new Subject<string>();

  constructor(protected http: HttpClient) { 
    super(http,`${environment.HOST}/signos`)
  }

  setMensajeCambio(mensaje: string) {
    this.mensajeCambio.next(mensaje);
  }

  getMensajeCambio() {
    return this.mensajeCambio.asObservable();
  }

  setSignoCambio(lista: Signo[]) {
    this.signoCambio.next(lista);
  }

  getSignoCambio() {
    return this.signoCambio.asObservable();
  }
}

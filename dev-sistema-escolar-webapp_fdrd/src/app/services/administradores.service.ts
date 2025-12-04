import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  private apiUrl = `${environment.url_api}/admin/`;
  private adminEndpoint = `${environment.url_api}/admin/`;
  private listaAdminsEndpoint = `${environment.url_api}/lista-admins/`;

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  private getHttpOptions() {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.facadeService.getSessionToken?.();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  public esquemaAdmin() {
    return {
      'clave_admin': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'rfc': '',
      'edad': '',
      'ocupacion': ''
    };
  }

  public validarAdmin(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data["clave_admin"]))
      error["clave_admin"] = this.errorService.required;

    if (!this.validatorService.required(data["first_name"]))
      error["first_name"] = this.errorService.required;

    if (!this.validatorService.required(data["last_name"]))
      error["last_name"] = this.errorService.required;

    if (!this.validatorService.required(data["email"]))
      error["email"] = this.errorService.required;
    else if (!this.validatorService.max(data["email"], 40))
      error["email"] = this.errorService.max(40);
    else if (!this.validatorService.email(data["email"]))
      error["email"] = this.errorService.email;

    if (!editar) {
      if (!this.validatorService.required(data["password"]))
        error["password"] = this.errorService.required;
      if (!this.validatorService.required(data["confirmar_password"]))
        error["confirmar_password"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["rfc"]))
      error["rfc"] = this.errorService.required;
    else if (!this.validatorService.min(data["rfc"], 12))
      error["rfc"] = this.errorService.min(12);
    else if (!this.validatorService.max(data["rfc"], 13))
      error["rfc"] = this.errorService.max(13);

    if (!this.validatorService.required(data["edad"]))
      error["edad"] = this.errorService.required;
    else if (!this.validatorService.numeric(data["edad"]))
      error["edad"] = "Solo números permitidos";
    else if (data["edad"] < 18)
      error["edad"] = "La edad debe ser mayor o igual a 18";

    if (!this.validatorService.required(data["telefono"]))
      error["telefono"] = this.errorService.required;

    if (!this.validatorService.required(data["ocupacion"]))
      error["ocupacion"] = this.errorService.required;

    return error;
  }

  public registrarAdmin(data: any): Observable<any> {
    const endpoint = this.apiUrl;
    return this.http.post<any>(endpoint, data, this.getHttpOptions());
  }

  // Obtener lista de administradores
  public obtenerListaAdmins(): Observable<any> {
    return this.http.get<any>(this.listaAdminsEndpoint, this.getHttpOptions());
  }

  // Obtener administrador por ID
  public obtenerAdminPorID(idAdmin: number): Observable<any> {
    return this.http.get<any>(`${this.adminEndpoint}?id=${idAdmin}`, this.getHttpOptions());
  }

  // Actualizar administrador
  public actualizarAdmin(data: any): Observable<any> {
    return this.http.put<any>(this.adminEndpoint, data, this.getHttpOptions());
  }

  // Petición para eliminar un administrador
  public eliminarAdmin(idAdmin: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.delete<any>(`${environment.url_api}/admin/${idAdmin}/`, { headers });
  }

  // Servicio para obtener el total de usuarios registrados por rol
  public getTotalUsuarios(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/total-usuarios/`, { headers });
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {

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

  // Esquema inicial de un maestro
  public esquemaMaestro() {
    return {
      idTrabajador: '',
      nombre: '',
      apellidos: '',
      correoElectronico: '',
      contrasena: '',
      confirmarContrasena: '',
      fechaNacimiento: '',
      telefono: '',
      rfc: '',
      cubiculo: '',
      areaInvestigacion: '',
      materias: [] as string[]
    };
  }

  // Registro del maestro
  public registrarMaestro(maestro: any) {
    const url = `${environment.url_api}/maestros/`;
    let fecha = maestro.fechaNacimiento;
    if (fecha && typeof fecha === 'string' && fecha.includes('/')) {
      fecha = fecha.replace(/\//g, '-');
    }
    const body = {
      rol: (maestro.rol || 'maestro'),
      first_name: maestro.nombre,
      last_name: maestro.apellidos,
      email: maestro.correoElectronico,
      password: maestro.contrasena,
      id_trabajador: maestro.idTrabajador,
      telefono: maestro.telefono,
      area_investigacion: maestro.areaInvestigacion,
      cubiculo: maestro.cubiculo,
      rfc: maestro.rfc,
      fecha_nacimiento: fecha,
      materias_json: (maestro.materias || []).map((m: any) => m?.nombre ? m.nombre : m)
    };

    console.log('Enviando datos al backend:', body);
    return this.http.post(url, body, this.getHttpOptions());
  }

  // Listar todos los maestros
  public listarMaestros() {
    const url = `${environment.url_api}/lista-maestros/`;
    return this.http.get<any[]>(url, this.getHttpOptions());
  }

  // Obtener maestro por id
  public obtenerMaestro(id: number) {
    const url = `${environment.url_api}/maestros/${id}/`;
    return this.http.get(url, this.getHttpOptions());
  }

  // Actualizar maestro
  public actualizarMaestro(id: number, data: any) {
    const url = `${environment.url_api}/maestros/${id}/`;
    return this.http.put(url, data, this.getHttpOptions());
  }

  //Servicio para eliminar un maestro
  public eliminarMaestro(idMaestro: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/maestros/${idMaestro}/`, { headers });
  }

  public validarMaestro(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data.idTrabajador)) {
      error.idTrabajador = this.errorService.required;
    } else if (!/^[0-9]+$/.test(data.idTrabajador)) {
      error.idTrabajador = "El ID de trabajador solo puede contener números";
    } else if (data.idTrabajador.length !== 9) {
      error.idTrabajador = "El ID de trabajador debe tener exactamente 9 dígitos";
    }

    if (!this.validatorService.required(data.nombre)) {
      error.nombre = this.errorService.required;
    }

    if (!this.validatorService.required(data.apellidos)) {
      error.apellidos = this.errorService.required;
    }

    if (!this.validatorService.required(data.correoElectronico)) {
      error.correoElectronico = this.errorService.required;
    } else if (!this.validatorService.email(data.correoElectronico)) {
      error.correoElectronico = this.errorService.email;
    }

    if (!editar) {
      if (!this.validatorService.required(data.contrasena)) {
        error.contrasena = this.errorService.required;
      } else if (!this.validatorService.min(data.contrasena, 8)) {
        error.contrasena = this.errorService.min(8);
      }

      if (!this.validatorService.required(data.confirmarContrasena)) {
        error.confirmarContrasena = this.errorService.required;
      } else if (data.contrasena !== data.confirmarContrasena) {
        error.confirmarContrasena = "Las contraseñas no coinciden";
      }
    }

    if (!this.validatorService.required(data.fechaNacimiento)) {
      error.fechaNacimiento = this.errorService.required;
    }

    if (!this.validatorService.required(data.telefono)) {
      error.telefono = this.errorService.required;
    }

    if (!this.validatorService.required(data.rfc)) {
      error.rfc = this.errorService.required;
    }

    if (!this.validatorService.required(data.cubiculo)) {
      error.cubiculo = this.errorService.required;
    }

    if (!this.validatorService.required(data.areaInvestigacion)) {
      error.areaInvestigacion = this.errorService.required;
    }

    if (!data.materias || data.materias.length === 0) {
      error.materias = "Debe seleccionar al menos una materia";
    }

    return error;
  }
}

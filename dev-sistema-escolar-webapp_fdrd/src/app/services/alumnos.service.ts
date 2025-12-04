import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {

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

  public esquemaAlumno() {
    return {
      idMatricula: '',
      nombre: '',
      apellidos: '',
      correoElectronico: '',
      contrasena: '',
      confirmarContrasena: '',
      fechaNacimiento: '',
      curp: '',
      rfc: '',
      edad: null,
      telefono: '',
      ocupacion: ''
    };
  }

  public validarAlumno(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data.idMatricula)) {
      error.idMatricula = this.errorService.required;
    } else if (!/^[0-9]+$/.test(data.idMatricula)) {
      error.idMatricula = "La matrícula solo puede contener números";
    } else if (data.idMatricula.length !== 9) {
      error.idMatricula = "La matrícula debe tener exactamente 9 números";
    }

    if(!this.validatorService.required(data.nombre)){
      error.nombre = this.errorService.required;
    }

    if(!this.validatorService.required(data.apellidos)){
      error.apellidos = this.errorService.required;
    }

    if(!this.validatorService.required(data.correoElectronico)){
      error.correoElectronico = this.errorService.required;
    } else if(!this.validatorService.max(data.correoElectronico, 40)){
      error.correoElectronico = this.errorService.max(40);
    } else if(!this.validatorService.email(data.correoElectronico)){
      error.correoElectronico = this.errorService.email;
    }

    if(!editar){
      if(!this.validatorService.required(data.contrasena)){
        error.contrasena = this.errorService.required;
      } else if(!this.validatorService.min(data.contrasena, 8)){
        error.contrasena = this.errorService.min(8);
      }

      if(!this.validatorService.required(data.confirmarContrasena)){
        error.confirmarContrasena = this.errorService.required;
      } else if(data.contrasena !== data.confirmarContrasena){
        error.confirmarContrasena = "Las contraseñas no coinciden";
      }
    }

    if(!this.validatorService.required(data.fechaNacimiento)){
      error.fechaNacimiento = this.errorService.required;
    } else if(!this.validatorService.date(data.fechaNacimiento)){
      error.fechaNacimiento = this.errorService.betweenDate;
    }

    if(!this.validatorService.required(data.curp)){
      error.curp = this.errorService.required;
    } else if(!this.validatorService.min(data.curp, 18) || !this.validatorService.max(data.curp, 18)){
      error.curp = "La CURP debe tener exactamente 18 caracteres";
    }

    if(!this.validatorService.required(data.rfc)){
      error.rfc = this.errorService.required;
    } else if(!this.validatorService.min(data.rfc, 12) || !this.validatorService.max(data.rfc, 13)){
      error.rfc = "El RFC debe tener 12 o 13 caracteres";
    }

    if(data.edad !== null && data.edad !== undefined && data.edad !== ""){
      if(!this.validatorService.numeric(data.edad)){
        error.edad = this.errorService.numeric;
      } else if(data.edad < 15){
        error.edad = "La edad debe ser mayor o igual a 15 años";
      } else if(data.edad > 100){
        error.edad = "La edad debe ser menor a 100 años";
      }
    }

    if(!this.validatorService.required(data.telefono)){
      error.telefono = this.errorService.required;
    } else if(!this.validatorService.min(data.telefono, 10)){
      error.telefono = this.errorService.min(10);
    } else if(!this.validatorService.numeric(data.telefono)){
      error.telefono = "Solo se permiten números en el teléfono";
    }

    if(!this.validatorService.required(data.ocupacion)){
      error.ocupacion = this.errorService.required;
    }

    return error;
  }

  public crearAlumno(alumno: any) {
    const url = `${environment.url_api}/alumnos/`;
    let fecha = alumno.fechaNacimiento;
    if (fecha && fecha.includes('/')) {
      fecha = fecha.replace(/\//g, '-');
    }
    const body = {
      rol: (alumno.rol || 'alumno'),
      first_name: alumno.nombre,
      last_name: alumno.apellidos,
      email: alumno.correoElectronico,
      password: alumno.contrasena,
      matricula: alumno.idMatricula,
      telefono: alumno.telefono,
      fecha_nacimiento: fecha,
      curp: alumno.curp || '',
      rfc: alumno.rfc || '',
      edad: alumno.edad || null,
      ocupacion: alumno.ocupacion || ''
    };
    return this.http.post(url, body, this.getHttpOptions());
  }

  public listarAlumnos() {
    const url = `${environment.url_api}/lista-alumnos/`;
    return this.http.get<any[]>(url, this.getHttpOptions());
  }

  public obtenerAlumno(id: number) {
    const url = `${environment.url_api}/alumnos/${id}/`;
    return this.http.get(url, this.getHttpOptions());
  }

  public actualizarAlumno(id: number, data: any) {
    const url = `${environment.url_api}/alumnos/${id}/`;
    return this.http.put(url, data, this.getHttpOptions());
  }

  //Eliminar alumno
  public eliminarAlumno(idAlumno: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/alumnos/${idAlumno}/`, { headers });
  }
}

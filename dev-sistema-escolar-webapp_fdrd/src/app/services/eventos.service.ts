import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
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

  public esquemaEvento() {
    return {
      nombre_evento: '',
      tipo_evento: '',
      fecha_realizacion: null,
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      publico_estudiantes: false,
      publico_maestros: false,
      publico_general: false,
      programa_educativo: '',
      responsable_id: '',
      descripcion: '',
      cupo_maximo: null
    };
  }

  public validarEvento(data: any, editar: boolean): any {
    let errors: any = {};

    if (!data.nombre_evento || data.nombre_evento.trim() === '') {
      errors.nombre_evento = 'El nombre del evento es obligatorio';
    } else if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/.test(data.nombre_evento)) {
      errors.nombre_evento = 'El nombre solo debe contener letras, números y espacios';
    }

    if (!data.tipo_evento || data.tipo_evento === '') {
      errors.tipo_evento = 'El tipo de evento es obligatorio';
    }

    if (!data.fecha_realizacion) {
      errors.fecha_realizacion = 'La fecha de realización es obligatoria';
    } else {
      const fechaSeleccionada = new Date(data.fecha_realizacion);
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < fechaHoy) {
        errors.fecha_realizacion = 'No se pueden seleccionar fechas anteriores al día actual';
      }
    }

    if (!data.hora_inicio || data.hora_inicio.trim() === '') {
      errors.hora_inicio = 'La hora de inicio es obligatoria';
    }

    if (!data.hora_fin || data.hora_fin.trim() === '') {
      errors.hora_fin = 'La hora de finalización es obligatoria';
    }

    if (data.hora_inicio && data.hora_fin) {
      if (data.hora_inicio >= data.hora_fin) {
        errors.hora_fin = 'La hora de finalización debe ser posterior a la hora de inicio';
      }
    }

    if (!data.lugar || data.lugar.trim() === '') {
      errors.lugar = 'El lugar es obligatorio';
    } else if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/.test(data.lugar)) {
      errors.lugar = 'El lugar solo debe contener caracteres alfanuméricos y espacios';
    }

    if (!data.publico_estudiantes && !data.publico_maestros && !data.publico_general) {
      errors.publico_objetivo = 'Debe seleccionar al menos un tipo de público objetivo';
    }

    if (data.publico_estudiantes && (!data.programa_educativo || data.programa_educativo === '')) {
      errors.programa_educativo = 'El programa educativo es obligatorio';
    }

    if (!data.responsable_id || data.responsable_id === '') {
      errors.responsable_id = 'Debe seleccionar un responsable del evento';
    }

    if (!data.descripcion || data.descripcion.trim() === '') {
      errors.descripcion = 'La descripción es obligatoria';
    } else if (data.descripcion.length > 300) {
      errors.descripcion = 'La descripción no puede exceder los 300 caracteres';
    } else if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ!,.:;?]+$/.test(data.descripcion)) {
      errors.descripcion = 'La descripción solo debe contener letras, números y signos de puntuación básicos';
    }

    if (!data.cupo_maximo) {
      errors.cupo_maximo = 'El cupo máximo es obligatorio';
    } else if (isNaN(data.cupo_maximo) || data.cupo_maximo <= 0) {
      errors.cupo_maximo = 'El cupo máximo debe ser un número positivo';
    } else if (data.cupo_maximo > 999) {
      errors.cupo_maximo = 'El cupo máximo no puede exceder los 3 dígitos (999)';
    } else if (!Number.isInteger(Number(data.cupo_maximo))) {
      errors.cupo_maximo = 'El cupo máximo debe ser un número entero';
    }

    return errors;
  }

  public registrarEvento(data: any): Observable<any> {
    let body = {
      nombre_evento: data.nombre_evento,
      tipo_evento: data.tipo_evento,
      fecha_realizacion: this.formatearFecha(data.fecha_realizacion),
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      lugar: data.lugar,
      publico_estudiantes: data.publico_estudiantes || false,
      publico_maestros: data.publico_maestros || false,
      publico_general: data.publico_general || false,
      programa_educativo: data.programa_educativo || '',
      responsable_id: data.responsable_id,
      descripcion: data.descripcion,
      cupo_maximo: parseInt(data.cupo_maximo)
    };

    return this.http.post<any>(`${this.apiUrl}/eventos/`, body, this.getHttpOptions());
  }

  public obtenerListaEventos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lista-eventos/`, this.getHttpOptions());
  }

  public obtenerEvento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/eventos/${id}/`, this.getHttpOptions());
  }

  public actualizarEvento(id: number, data: any): Observable<any> {
    let body = {
      nombre_evento: data.nombre_evento,
      tipo_evento: data.tipo_evento,
      fecha_realizacion: this.formatearFecha(data.fecha_realizacion),
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      lugar: data.lugar,
      publico_estudiantes: data.publico_estudiantes || false,
      publico_maestros: data.publico_maestros || false,
      publico_general: data.publico_general || false,
      programa_educativo: data.programa_educativo || '',
      responsable_id: data.responsable_id,
      descripcion: data.descripcion,
      cupo_maximo: parseInt(data.cupo_maximo)
    };

    return this.http.put<any>(`${this.apiUrl}/eventos/${id}/`, body, this.getHttpOptions());
  }

  public eliminarEvento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/eventos/${id}/`, this.getHttpOptions());
  }

  // Formatear fecha para enviar al backend (YYYY-MM-DD)
  private formatearFecha(fecha: any): string {
    if (!fecha) return '';

    const fechaObj = new Date(fecha);
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit, OnChanges {

  @Input() datos_evento: any = {};

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public successMessage: string = '';
  public isSubmitting: boolean = false;
  public eventoId: number | null = null;
  public token: string = "";
  public rol: string = "";
  public minDate: Date = new Date();
  public administradores: any[] = [];
  public maestros: any[] = [];

  public tiposEvento: any[] = [
    { value: 'Conferencia', nombre: 'Conferencia' },
    { value: 'Taller', nombre: 'Taller' },
    { value: 'Seminario', nombre: 'Seminario' },
    { value: 'Concurso', nombre: 'Concurso' }
  ];

  public programasEducativos: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', nombre: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', nombre: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', nombre: 'Ingeniería en Tecnologías de la Información' }
  ];

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();
    this.rol = this.facadeService.getUserGroup();

    if (this.rol !== 'administrador') {
      alert('No tienes permisos para registrar eventos. Esta función es solo para administradores.');
      this.router.navigate(['/home']);
      return;
    }

    this.cargarAdministradores();
    this.cargarMaestros();

    const idParam = this.activatedRoute.snapshot.params['id'];
    const navState: any = this.location.getState?.() || {};
    const incoming = navState?.evento;

    if (incoming) {
      this.setEventoFromIncoming(incoming);
    } else if (idParam) {
      this.editar = true;
      this.eventoId = Number(idParam);
      this.eventosService.obtenerEvento(this.eventoId).subscribe({
        next: (evento) => this.setEventoFromIncoming(evento),
        error: (err) => {
          console.error('Error al cargar evento por ID:', err);
          this.evento = this.eventosService.esquemaEvento();
        }
      });
    } else {
      this.evento = this.eventosService.esquemaEvento();
    }
    console.log('Datos evento iniciales:', this.evento);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos_evento'] && changes['datos_evento'].currentValue) {
      const incoming = changes['datos_evento'].currentValue;
      this.setEventoFromIncoming(incoming);
    }
  }

  private setEventoFromIncoming(incoming: any): void {
    this.editar = true;
    this.eventoId = incoming?.id ?? null;
    this.evento = {
      nombre_evento: incoming?.nombre_evento || '',
      tipo_evento: incoming?.tipo_evento || '',
      fecha_realizacion: incoming?.fecha_realizacion ? new Date(incoming.fecha_realizacion) : null,
      hora_inicio: incoming?.hora_inicio || '',
      hora_fin: incoming?.hora_fin || '',
      lugar: incoming?.lugar || '',
      publico_estudiantes: incoming?.publico_estudiantes || false,
      publico_maestros: incoming?.publico_maestros || false,
      publico_general: incoming?.publico_general || false,
      programa_educativo: incoming?.programa_educativo || '',
      responsable_id: incoming?.responsable_id || '',
      descripcion: incoming?.descripcion || '',
      cupo_maximo: incoming?.cupo_maximo ?? null
    };
    console.log('Editando evento, datos precargados:', this.evento);
  }

  cargarAdministradores(): void {
    this.administradoresService.obtenerListaAdmins().subscribe({
      next: (response) => {
        console.log('Administradores obtenidos:', response);
        this.administradores = response || [];
      },
      error: (error) => {
        console.error('Error al cargar administradores:', error);
        this.administradores = [];
      }
    });
  }

  cargarMaestros(): void {
    this.maestrosService.listarMaestros().subscribe({
      next: (response) => {
        console.log('Maestros obtenidos:', response);
        this.maestros = response || [];
      },
      error: (error) => {
        console.error('Error al cargar maestros:', error);
        this.maestros = [];
      }
    });
  }

  public mostrarProgramaEducativo(): boolean {
    return this.evento.publico_estudiantes === true;
  }

  public onPublicoChange(): void {
    if (!this.evento.publico_estudiantes) {
      this.evento.programa_educativo = '';
      if (this.errors.programa_educativo) {
        delete this.errors.programa_educativo;
      }
    }
  }

  soloNumeros(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    const esNumero = charCode >= 48 && charCode <= 57;

    if (!esNumero) {
      event.preventDefault();
    }
  }

  public convertirHora12a24(hora12: string): string {
    if (!hora12) return '';

    const [time, modifier] = hora12.split(' ');
    if (!time || !modifier) return hora12;

    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const horasStr = hours.toString().padStart(2, '0');
    const minutosStr = minutes.toString().padStart(2, '0');

    return `${horasStr}:${minutosStr}`;
  }

  public convertirHora24a12(hora24: string): string {
    if (!hora24) return '';

    let [hours, minutes] = hora24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const horasStr = hours.toString().padStart(2, '0');
    const minutosStr = minutes.toString().padStart(2, '0');

    return `${horasStr}:${minutosStr} ${ampm}`;
  }

  public cambioHoraInicio($event: any): void {
    const hora = $event.target?.value || $event;
    if (hora) {
      if (hora.includes('AM') || hora.includes('PM')) {
        this.evento.hora_inicio = this.convertirHora12a24(hora);
      } else {
        this.evento.hora_inicio = hora;
      }
      console.log('Hora inicio convertida:', this.evento.hora_inicio);
    }
  }

  public cambioHoraFinal($event: any): void {
    const hora = $event.target?.value || $event;
    if (hora) {
      if (hora.includes('AM') || hora.includes('PM')) {
        this.evento.hora_fin = this.convertirHora12a24(hora);
      } else {
        this.evento.hora_fin = hora;
      }
      console.log('Hora fin convertida:', this.evento.hora_fin);
    }
  }

  validarHoraInput(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    const esNumero = charCode >= 48 && charCode <= 57;
    const esDosPuntos = charCode === 58; // ':'

    if (!esNumero && !esDosPuntos) {
      event.preventDefault();
    }
  }

  formatearHora(event: any, campo: string): void {
    let valor = event.target.value.replace(/[^0-9]/g, '');

    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + ':' + valor.substring(2, 4);
    }

    if (campo === 'hora_inicio') {
      this.evento.hora_inicio = valor;
    } else if (campo === 'hora_fin') {
      this.evento.hora_fin = valor;
    }
  }

  soloLetrasNumerosYEspacios(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esNumero = charCode >= 48 && charCode <= 57;
    const esEspacio = charCode === 32;
    const esLetraAcentuada = [193, 201, 205, 211, 218, 225, 233, 237, 243, 250, 209, 241].includes(charCode);

    if (!esLetraMayuscula && !esLetraMinuscula && !esNumero && !esEspacio && !esLetraAcentuada) {
      event.preventDefault();
    }
  }

  soloLetrasNumerosYPuntuacion(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esNumero = charCode >= 48 && charCode <= 57;
    const esEspacio = charCode === 32;
    const esLetraAcentuada = [193, 201, 205, 211, 218, 225, 233, 237, 243, 250, 209, 241].includes(charCode);
    const esPuntuacion = [33, 44, 46, 58, 59, 63].includes(charCode); //!,.;:;?

    if (!esLetraMayuscula && !esLetraMinuscula && !esNumero && !esEspacio && !esLetraAcentuada && !esPuntuacion) {
      event.preventDefault();
    }
  }

  public registrar(): void {
    if (this.rol !== 'administrador') {
      alert('No tienes permisos para registrar eventos.');
      return;
    }

    if (this.isSubmitting) {
      console.warn('Solicitud en curso, evitando envío duplicado.');
      return;
    }

    this.errors = this.eventosService.validarEvento(this.evento, this.editar);

    if (this.evento.hora_inicio && this.evento.hora_fin) {
      if (this.evento.hora_inicio >= this.evento.hora_fin) {
        this.errors.hora_fin = 'La hora de finalización debe ser posterior a la hora de inicio';
      }
    }

    if (!this.evento.publico_estudiantes && !this.evento.publico_maestros && !this.evento.publico_general) {
      this.errors.publico_objetivo = 'Debe seleccionar al menos un tipo de público objetivo';
    }

    if (Object.keys(this.errors).length > 0) {
      console.warn('Errores de validación:', this.errors);
      return;
    }

    console.log('Datos validados, enviando al backend...');
    console.log('Datos enviados:', this.evento);

    this.isSubmitting = true;
    this.eventosService.registrarEvento(this.evento).subscribe({
      next: (res) => {
        console.log('Evento registrado correctamente:', res);
        this.successMessage = '¡Registro de evento exitoso!';
        alert(this.successMessage);
        this.isSubmitting = false;
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        console.error('Error al registrar evento:', err);
        if (err.error?.message) {
          alert(err.error.message);
        } else {
          alert('Error al registrar el evento. Revisa la consola para más detalles.');
        }
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('Petición completada.');
        this.isSubmitting = false;
      }
    });
  }

  public actualizar(): void {
    if (this.rol !== 'administrador') {
      alert('No tienes permisos para actualizar eventos.');
      return;
    }

    if (!this.eventoId) {
      alert('No se encontró el ID del evento a actualizar.');
      return;
    }

    this.errors = this.eventosService.validarEvento(this.evento, true);
    if (this.evento.hora_inicio && this.evento.hora_fin) {
      if (this.evento.hora_inicio >= this.evento.hora_fin) {
        this.errors.hora_fin = 'La hora de finalización debe ser posterior a la hora de inicio';
      }
    }

    if (!this.evento.publico_estudiantes && !this.evento.publico_maestros && !this.evento.publico_general) {
      this.errors.publico_objetivo = 'Debe seleccionar al menos un tipo de público objetivo';
    }

    if (Object.keys(this.errors).length > 0) {
      console.warn('Errores de validación:', this.errors);
      return;
    }

    console.log('Datos validados, actualizando evento...');

    this.isSubmitting = true;
    this.eventosService.actualizarEvento(this.eventoId, this.evento).subscribe({
      next: (res) => {
        console.log('Evento actualizado correctamente:', res);
        alert('Evento actualizado correctamente');
        this.isSubmitting = false;
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        console.error('Error al actualizar evento:', err);
        alert('Error al actualizar el evento.');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  public regresar(): void {
    this.location.back();
  }
}

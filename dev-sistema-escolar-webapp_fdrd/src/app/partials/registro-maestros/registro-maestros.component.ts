import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MaestrosService } from 'src/app/services/maestros.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit, OnChanges {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public passwordVisible: boolean = false;
  public successMessage: string = '';
  public isSubmitting: boolean = false;
  public maestroId: number | null = null;

  public areas: any[] = [
    { value: '1', viewValue: 'Desarrollo Web' },
    { value: '2', viewValue: 'Programación' },
    { value: '3', viewValue: 'Bases de datos' },
    { value: '4', viewValue: 'Redes' },
    { value: '5', viewValue: 'Matemáticas' },
  ];

  public materias: any[] = [
    { value: '1', nombre: 'Aplicaciones Web' },
    { value: '2', nombre: 'Programación 1' },
    { value: '3', nombre: 'Bases de datos' },
    { value: '4', nombre: 'Tecnologías Web' },
    { value: '5', nombre: 'Minería de datos' },
    { value: '6', nombre: 'Desarrollo móvil' },
    { value: '7', nombre: 'Estructuras de datos' },
    { value: '8', nombre: 'Administración de redes' },
    { value: '9', nombre: 'Ingeniería de Software' },
    { value: '10', nombre: 'Administración de S.O.' },
  ];

  constructor(
    private location: Location,
    private maestrosService: MaestrosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.maestro = this.maestrosService.esquemaMaestro();
    console.log("Datos iniciales del maestro:", this.maestro);
  }

  // Reflejar datos cuando el padre envíe el maestro a editar
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos_user'] && changes['datos_user'].currentValue) {
      const incoming = changes['datos_user'].currentValue;
      this.editar = true;
      this.maestroId = incoming?.id ?? null;
      // Mapear campos desde la respuesta del backend
      this.maestro = {
        ...(this.maestro || {}),
        idTrabajador: incoming.id_trabajador || '',
        nombre: incoming.user?.first_name ?? incoming.first_name ?? '',
        apellidos: incoming.user?.last_name ?? incoming.last_name ?? '',
        correoElectronico: incoming.user?.email ?? incoming.email ?? '',
        telefono: incoming.telefono || '',
        rfc: incoming.rfc || '',
        cubiculo: incoming.cubiculo || '',
        areaInvestigacion: incoming.area_investigacion || '',
        fechaNacimiento: incoming.fecha_nacimiento || '',
        materias: Array.isArray(incoming.materias_json) ? incoming.materias_json : []
      };
      console.log('Editando maestro, datos precargados:', this.maestro);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  seleccionarMateria(materia: string, isChecked: boolean): void {
    if (isChecked) {
      if (!this.maestro.materias.includes(materia)) {
        this.maestro.materias.push(materia);
      }
    } else {
      this.maestro.materias = this.maestro.materias.filter((m: string) => m !== materia);
    }
    console.log('Materias seleccionadas:', this.maestro.materias);
  }

  isMateriaSelected(materia: string): boolean {
    return this.maestro.materias.includes(materia);
  }

  registrarMaestro(): void {
    if (this.isSubmitting) {
      console.warn('Solicitud en curso, evitando envío duplicado.');
      return;
    }
    // Asegurar rol antes de enviar
    this.maestro.rol = (this.rol || 'maestro').toLowerCase();
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);

    if (Object.keys(this.errors).length > 0) {
      console.warn('Errores de validación:', this.errors);
      return;
    }

    console.log('Datos validados, enviando al backend...');
    console.log('Datos enviados:', this.maestro);

    this.isSubmitting = true;
    this.maestrosService.registrarMaestro(this.maestro).subscribe({
      next: (res) => {
        console.log('Maestro registrado correctamente:', res);
        this.successMessage = '¡Registro de maestro exitoso!';
        alert(this.successMessage);
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Error al registrar maestro:', err);
        if (err.error?.message) {
          alert(err.error.message);
        } else {
          alert('Error al registrar el maestro. Revisa la consola para más detalles.');
        }
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('Petición completada.');
        this.isSubmitting = false;
      }
    });
  }

  actualizarMaestro(): void {
    if (!this.maestroId) {
      alert('No se encontró el ID del maestro a actualizar.');
      return;
    }
    this.errors = this.maestrosService.validarMaestro(this.maestro, true);
    if (Object.keys(this.errors).length > 0) {
      console.warn('Errores de validación:', this.errors);
      return;
    }
    // Normalizar fecha si viene con '/'
    let fecha = this.maestro.fechaNacimiento;
    if (fecha && typeof fecha === 'string' && fecha.includes('/')) {
      fecha = fecha.replace(/\//g, '-');
    }
    const body = {
      first_name: this.maestro.nombre,
      last_name: this.maestro.apellidos,
      id_trabajador: this.maestro.idTrabajador,
      fecha_nacimiento: fecha,
      telefono: this.maestro.telefono,
      rfc: this.maestro.rfc,
      cubiculo: this.maestro.cubiculo,
      area_investigacion: this.maestro.areaInvestigacion,
      materias_json: (this.maestro.materias || []).map((m: any) => m?.nombre ? m.nombre : m)
    };
    this.isSubmitting = true;
    this.maestrosService.actualizarMaestro(this.maestroId, body).subscribe({
      next: (res) => {
        console.log('Maestro actualizado correctamente:', res);
        alert('Maestro actualizado correctamente');
        this.isSubmitting = false;
        this.router.navigate(['/maestros']);
      },
      error: (err) => {
        console.error('Error al actualizar maestro:', err);
        alert('Error al actualizar el maestro.');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  regresar(): void {
    this.location.back();
  }

  cancelarRegistro(): void {
    this.maestro = this.maestrosService.esquemaMaestro();
    this.errors = {};
    alert('Formulario de registro cancelado y reseteado.');
  }

  soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esLetraAcentuada = [193, 201, 205, 211, 218, 225, 233, 237, 243, 250, 209, 241].includes(charCode); // ÁÉÍÓÚáéíóúÑñ
    const esEspacio = charCode === 32;

    if (!esLetraMayuscula && !esLetraMinuscula && !esLetraAcentuada && !esEspacio) {
      event.preventDefault();
    }
  }

  soloLetrasYNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esNumero = charCode >= 48 && charCode <= 57;

    if (!esLetraMayuscula && !esLetraMinuscula && !esNumero) {
      event.preventDefault();
    }
  }

  soloLetrasYNumerosConEspacio(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esNumero = charCode >= 48 && charCode <= 57;
    const esEspacio = charCode === 32;

    if (!esLetraMayuscula && !esLetraMinuscula && !esNumero && !esEspacio) {
      event.preventDefault();
    }
  }
}

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit, OnChanges {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public alumno: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public passwordVisible: boolean = false;
  public successMessage: string = '';
  public alumnoId: number | null = null;

  constructor(
    private location: Location,
    private alumnosService: AlumnosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.alumno = this.alumnosService.esquemaAlumno();
    console.log("Datos alumno inicial:", this.alumno);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos_user'] && changes['datos_user'].currentValue) {
      const incoming = changes['datos_user'].currentValue;
      this.editar = true;
      this.alumnoId = incoming?.id ?? null;
      this.alumno = {
        ...(this.alumno || {}),
        idMatricula: incoming.matricula || '',
        nombre: incoming.user?.first_name ?? incoming.first_name ?? '',
        apellidos: incoming.user?.last_name ?? incoming.last_name ?? '',
        correoElectronico: incoming.user?.email ?? incoming.email ?? '',
        fechaNacimiento: incoming.fecha_nacimiento || '',
        edad: incoming.edad ?? null,
        telefono: incoming.telefono || '',
        curp: incoming.curp || '',
        rfc: incoming.rfc || '',
        ocupacion: incoming.ocupacion || ''
      };
      console.log('Editando alumno, datos precargados:', this.alumno);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  calcularEdad(): void {
    const fechaNacimiento = this.alumno.fechaNacimiento;
    if (fechaNacimiento) {
      const hoy = new Date();
      const cumpleanos = new Date(fechaNacimiento);

      let edad = hoy.getFullYear() - cumpleanos.getFullYear();
      const mes = hoy.getMonth() - cumpleanos.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
      }
      this.alumno.edad = edad;
    } else {
      this.alumno.edad = null;
    }
  }

  registrarAlumno(): void {
    // Asegurar rol antes de enviar
    this.alumno.rol = (this.rol || 'alumno');

    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if (Object.keys(this.errors).length > 0) {
      console.warn('Errores de validación:', this.errors);
      return;
    }

    this.alumnosService.crearAlumno(this.alumno).subscribe({
      next: (res: any) => {
        console.log('Alumno registrado:', res);
        this.successMessage = '¡Registro de alumno exitoso!';
        this.alumno = this.alumnosService.esquemaAlumno();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('Error al registrar alumno:', err);
        if (err.error?.message) {
          alert(err.error.message);
        } else {
          alert('Ocurrió un error al registrar el alumno.');
        }
      }
    });
  }

  actualizarAlumno(): void {
    if (!this.alumnoId) {
      alert('No se encontró el ID del alumno a actualizar.');
      return;
    }
    this.errors = this.alumnosService.validarAlumno(this.alumno, true);
    if (Object.keys(this.errors).length > 0) {
      console.warn('Errores de validación:', this.errors);
      return;
    }
    let fecha = this.alumno.fechaNacimiento;
    if (fecha && typeof fecha === 'string' && fecha.includes('/')) {
      fecha = fecha.replace(/\//g, '-');
    }
    const body = {
      first_name: this.alumno.nombre,
      last_name: this.alumno.apellidos,
      matricula: this.alumno.idMatricula,
      curp: this.alumno.curp,
      rfc: this.alumno.rfc,
      fecha_nacimiento: fecha,
      edad: this.alumno.edad,
      telefono: this.alumno.telefono,
      ocupacion: this.alumno.ocupacion
    };
    this.alumnosService.actualizarAlumno(this.alumnoId, body).subscribe({
      next: (res: any) => {
        console.log('Alumno actualizado:', res);
        alert('Alumno actualizado correctamente');
        this.router.navigate(['/alumnos']);
      },
      error: (err) => {
        console.error('Error al actualizar alumno:', err);
        alert('Ocurrió un error al actualizar el alumno.');
      }
    });
  }

  public regresar(): void {
    this.location.back();
  }

  public cancelarRegistro(): void {
    this.alumno = this.alumnosService.esquemaAlumno();
    this.errors = {};
    this.successMessage = '';
    alert('Formulario de registro cancelado y reseteado.');
  }

  public soloLetras(event: KeyboardEvent): void {
    if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  public soloLetrasYNumeros(event: KeyboardEvent): void {
    if (!/^[a-zA-Z0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
}

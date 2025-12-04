import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit, OnChanges {

  @Input() rol: string = ''; 
  @Input() datos_user: any = {}; 

  public admin: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idUser: Number = 0;
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';
  public successMessage: string = '';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si hay parámetro ID en la URL, es edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      // En edición, los datos pueden llegar asincrónicamente vía Input
      // ngOnChanges se encargará de reflejarlos cuando estén disponibles
      this.admin = this.datos_user || {};
    }else{
      // Registro de nuevo administrador
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log('Datos admin iniciales:', this.admin);
  }

  // Reflejar cambios en datos_user cuando el padre termine de cargar al usuario
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos_user']) {
      const incoming = changes['datos_user'].currentValue;
      if (this.editar && incoming) {
        this.admin = {
          ...this.admin,
          ...incoming,
          // Asegurar campos planos desde respuesta anidada user
          first_name: incoming.user?.first_name ?? incoming.first_name ?? this.admin.first_name,
          last_name: incoming.user?.last_name ?? incoming.last_name ?? this.admin.last_name,
          email: incoming.user?.email ?? incoming.email ?? this.admin.email
        };
      }
    }
  }

  public showPassword() {
    this.inputType_1 = this.inputType_1 === 'password' ? 'text' : 'password';
    this.hide_1 = !this.hide_1;
  }

  public showPwdConfirmar() {
    this.inputType_2 = this.inputType_2 === 'password' ? 'text' : 'password';
    this.hide_2 = !this.hide_2;
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esLetraAcentuada = [193, 201, 205, 211, 218, 225, 233, 237, 243, 250, 209, 241].includes(charCode);
    const esEspacio = charCode === 32;

    if (!esLetraMayuscula && !esLetraMinuscula && !esLetraAcentuada && !esEspacio) event.preventDefault();
  }

  public soloLetrasYNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const esLetraMayuscula = charCode >= 65 && charCode <= 90;
    const esLetraMinuscula = charCode >= 97 && charCode <= 122;
    const esNumero = charCode >= 48 && charCode <= 57;

    if (!esLetraMayuscula && !esLetraMinuscula && !esNumero) event.preventDefault();
  }

  public registrar() {
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if (Object.keys(this.errors).length > 0) {
      console.log('Errores de validación:', this.errors);
      return;
    }

    console.log('Pasó la validación, enviando al backend...');
    
    this.administradoresService.registrarAdmin(this.admin).subscribe({
      next: (res) => {
        console.log('Registro exitoso:', res);
        this.successMessage = '¡Registro de administrador exitoso!';
        alert(this.successMessage);
        if(this.token && this.token !== ""){
          this.router.navigate(["administrador"]);
        }else{
          this.router.navigate(["/"]);
        }
      },
      error: (err) => {
        console.error('Error al registrar admin:', err);
        if (err.error?.message) alert(err.error.message);
        else alert('Error al registrar administrador. Revisa la consola.');
      }
    });
  }

  public actualizar(){
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }

    this.administradoresService.actualizarAdmin(this.admin).subscribe({
      next: (response) => {
        alert("Administrador actualizado exitosamente");
        console.log("Administrador actualizado: ", response);
        this.router.navigate(["administrador"]);
      },
      error: (error) => {
        alert("Error al actualizar administrador");
        console.error("Error al actualizar administrador: ", error);
      }
    });
  }

  public regresar() {
    this.location.back();
  }
}

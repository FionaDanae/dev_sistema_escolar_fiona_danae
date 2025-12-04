import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from '../../services/alumnos.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';

export interface AlumnoRow {
  id: number;
  user?: { first_name: string; last_name: string; email: string };
  first_name?: string;
  last_name?: string;
  email?: string;
  matricula?: string | number;
  rfc?: string;
  telefono?: string;
  ocupacion?: string;
}

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {
  lista_alumnos: AlumnoRow[] = [];
  isLoading = true;
  errorMsg = '';
  public rol: string = '';
  public token: string = '';
  // Conjuntos de columnas para diferentes anchos de pantalla
  private readonly fullColumns: string[] = [
    'matricula', 'first_name', 'last_name', 'email', 'telefono', 'rfc', 'ocupacion'
  ];
  private readonly compactColumns: string[] = [
    'matricula', 'first_name', 'last_name', 'email', 'telefono'
  ];
  private readonly superCompactColumns: string[] = [
    'matricula', 'first_name', 'last_name'
  ];
  displayedColumns: string[] = this.fullColumns;
  dataSource = new MatTableDataSource<AlumnoRow>(this.lista_alumnos);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) {
      this.dataSource.paginator = p;
    }
  }
  @ViewChild(MatSort) set sort(s: MatSort) {
    if (s) {
      this.dataSource.sort = s;
    }
  }

  constructor(
    private alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog,
    public facadeService: FacadeService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    if (!this.token) {
      this.router.navigate(['/']);
      return;
    }
    this.obtenerAlumnos();
    this.setupResponsiveColumns();

    if (this.rol === 'administrador') {
      this.fullColumns.push('editar', 'eliminar');
      this.compactColumns.push('editar', 'eliminar');
      this.superCompactColumns.push('editar', 'eliminar');
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.filterPredicate = (data: AlumnoRow, filter: string) => {
      const name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.toLowerCase();
      return name.includes(filter.trim().toLowerCase());
    };
  }

  public obtenerAlumnos(): void {
    this.isLoading = true;
    this.alumnosService.listarAlumnos().subscribe({
      next: (res: AlumnoRow[]) => {
        const lista = (res ?? []).map((usuario: any) => ({
          ...usuario,
          first_name: usuario.user?.first_name ?? '',
          last_name: usuario.user?.last_name ?? '',
          email: usuario.user?.email ?? ''
        }));
        this.lista_alumnos = lista;
        this.dataSource.data = lista;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'No se pudo cargar la lista de alumnos.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  public goEditar(idUser: number): void {
    this.router.navigate([`registro-usuarios/alumno/${idUser}`]);
  }

  public delete(idUser: number): void {
    const currentUserId = Number(this.facadeService.getUserId());
    if (this.rol != 'administrador') {
      alert('No tienes permisos para eliminar alumnos');
      return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idUser, rol: 'alumno' },
      height: '288px',
      width: '328px'
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result?.isDelete) {
        console.log('Alumno eliminado');
        alert('Alumno eliminado correctamente.');
        this.obtenerAlumnos();
      } else {
        alert('Alumno no se ha podido eliminar.');
        console.log('No se eliminó el alumno');
      }
    });
  }

  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value || '';
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private setupResponsiveColumns(): void {
    this.breakpointObserver
      .observe(['(max-width: 900px)', '(max-width: 1200px)'])
      .subscribe((state) => {
        const is900 = state.breakpoints['(max-width: 900px)'];
        const is1200 = state.breakpoints['(max-width: 1200px)'];
        if (is900) {
          this.displayedColumns = this.superCompactColumns;
        } else if (is1200) {
          this.displayedColumns = this.compactColumns;
        } else {
          this.displayedColumns = this.fullColumns;
        }
      });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EliminarEditarEventoModalComponent } from 'src/app/modals/eliminar-editar-evento/eliminar-editar-evento.component';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from '../../services/eventos.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';

export interface EventoRow {
  id: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha_realizacion: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  publico_estudiantes: boolean;
  publico_maestros: boolean;
  publico_general: boolean;
  programa_educativo?: string;
  responsable_id: number;
  responsable_tipo?: string;
  descripcion: string;
  cupo_maximo: number;
}

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {
  lista_eventos: EventoRow[] = [];
  isLoading = true;
  errorMsg = '';
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';

  private readonly adminColumns: string[] = [
    'nombre_evento', 'tipo_evento', 'fecha_realizacion', 'hora_inicio',
    'hora_fin', 'lugar', 'publico_objetivo', 'cupo_maximo', 'editar', 'eliminar'
  ];

  private readonly userColumns: string[] = [
    'nombre_evento', 'tipo_evento', 'fecha_realizacion', 'hora_inicio',
    'hora_fin', 'lugar', 'publico_objetivo', 'cupo_maximo'
  ];

  private readonly compactColumns: string[] = [
    'nombre_evento', 'tipo_evento', 'fecha_realizacion', 'lugar', 'editar', 'eliminar'
  ];

  private readonly userCompactColumns: string[] = [
    'nombre_evento', 'tipo_evento', 'fecha_realizacion', 'lugar'
  ];

  displayedColumns: string[] = this.adminColumns;
  dataSource = new MatTableDataSource<EventoRow>(this.lista_eventos);

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
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog,
    public facadeService: FacadeService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (!this.token) {
      this.router.navigate(['/']);
      return;
    }

    this.obtenerEventos();
    this.setupResponsiveColumns();
  }

  ngAfterViewInit(): void {
    this.dataSource.filterPredicate = (data: EventoRow, filter: string) => {
      const nombre = data.nombre_evento?.toLowerCase() || '';
      return nombre.includes(filter.trim().toLowerCase());
    };
  }

  public obtenerEventos(): void {
    this.isLoading = true;
    this.eventosService.obtenerListaEventos().subscribe({
      next: (res: EventoRow[]) => {
        let eventosFiltrados = res ?? [];

        if (this.rol === 'maestro') {
          eventosFiltrados = eventosFiltrados.filter(evento =>
            evento.publico_maestros || evento.publico_general
          );
        } else if (this.rol === 'alumno') {
          eventosFiltrados = eventosFiltrados.filter(evento =>
            evento.publico_estudiantes || evento.publico_general
          );
        }

        this.lista_eventos = eventosFiltrados;
        this.dataSource.data = eventosFiltrados;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'No se pudo cargar la lista de eventos.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  public irARegistroEvento(): void {
  this.router.navigate(['/registro-eventos']);
  }

  public goEditar(idEvento: number): void {
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarEditarEventoModalComponent, {
        data: { id: idEvento, evento: 'evento', mode: 'editar' },
        height: '288px',
        width: '328px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.isEdit) {
          this.eventosService.obtenerEvento(idEvento).subscribe({
            next: (evento) => {
              this.router.navigate([`/registro-eventos/${idEvento}`], {
                state: { evento }
              });
            },
            error: (err) => {
              console.error('Error al cargar evento:', err);
              alert('No se pudo cargar el evento para editar.');
            }
          });
        }
      });
    }
  }

  public delete(idEvento: number): void {
    if (this.rol !== 'administrador') {
      alert('No tienes permisos para eliminar eventos.');
      return;
    }

    const dialogRef = this.dialog.open(EliminarEditarEventoModalComponent, {
      data: { id: idEvento, evento: 'evento', mode: 'eliminar' },
      height: '288px',
      width: '328px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isDelete) {
        console.log('Evento eliminado');
        alert('Evento eliminado correctamente.');
        this.obtenerEventos();
      } else {
        console.log('No se eliminó el evento');
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

  public formatearPublicoObjetivo(evento: EventoRow): string {
    const publicos: string[] = [];

    if (evento.publico_estudiantes) publicos.push('Estudiantes');
    if (evento.publico_maestros) publicos.push('Maestros');
    if (evento.publico_general) publicos.push('Público General');

    return publicos.join(', ') || 'N/A';
  }

  public puedeEditarEliminar(): boolean {
    return this.rol === 'administrador';
  }

  private setupResponsiveColumns(): void {
    this.breakpointObserver
      .observe(['(max-width: 1200px)'])
      .subscribe((state) => {
        const is1200 = state.breakpoints['(max-width: 1200px)'];

        if (this.rol === 'administrador') {
          this.displayedColumns = is1200 ? this.compactColumns : this.adminColumns;
        } else {
          this.displayedColumns = is1200 ? this.userCompactColumns : this.userColumns;
        }
      });
  }
}

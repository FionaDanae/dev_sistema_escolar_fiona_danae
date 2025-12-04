import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-eliminar-editar-evento-modal',
  templateUrl: './eliminar-editar-evento.component.html',
  styleUrls: ['./eliminar-editar-evento.component.scss']
})
export class EliminarEditarEventoModalComponent implements OnInit {

  public evento: string = "";
  public mode: 'eliminar' | 'editar' = 'eliminar';

  constructor(
    private eventosService: EventosService,
    private dialogRef: MatDialogRef<EliminarEditarEventoModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.evento = this.data.evento;
    this.mode = (this.data.mode === 'editar') ? 'editar' : 'eliminar';
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

  public eliminarEvento(){
    this.eventosService.eliminarEvento(this.data.id).subscribe(
      (response)=>{
        console.log(response);
        this.dialogRef.close({isDelete:true});
      }, (error)=>{
        this.dialogRef.close({isDelete:false});
      }
    );
  }

  public editarEvento(){
    this.dialogRef.close({isEdit:true});
  }
}

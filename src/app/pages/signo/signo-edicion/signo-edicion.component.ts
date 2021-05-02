import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Paciente } from 'src/app/_model/paciente';
import { Signo } from 'src/app/_model/signo';
import { PacienteService } from 'src/app/_service/paciente.service';
import { SignoService } from 'src/app/_service/signo.service';

@Component({
  selector: 'app-signo-edicion',
  templateUrl: './signo-edicion.component.html',
  styleUrls: ['./signo-edicion.component.css']
})
export class SignoEdicionComponent implements OnInit {

  form: FormGroup;
  pacientes: Paciente[];
  id: number;
  edicion: boolean;

  //utiles para autocomplete
  myControlPaciente: FormControl = new FormControl();
  pacientesFiltrados$: Observable<Paciente[]>;

  maxFecha: Date = new Date();
  fechaSeleccionada: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signoService: SignoService,
    private pacienteService : PacienteService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'paciente': this.myControlPaciente,
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl(''),
      'pulso': new FormControl(''),
      'ritmo': new FormControl(''),
    });

    this.listarPacientes();

    this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));

    this.route.params.subscribe((data: Params) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.initForm();
    });
  }

  filtrarPacientes(val: any){
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(el =>
        el.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || el.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || el.dni.includes(val.dni)
      );
      //EMPTY de RxJS
    }
    return this.pacientes.filter(el => 
      el.nombres.toLowerCase().includes(val?.toLowerCase()) || el.apellidos.toLowerCase().includes(val?.toLowerCase()) || el.dni.includes(val)
    );
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  mostrarPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  operar() {
    let signo = new Signo();
    signo.idSigno = this.form.value['id'];
    signo.paciente = this.form.value['paciente'];
    signo.fecha =  moment(this.form.value['fecha']).format('YYYY-MM-DDTHH:mm:ss');
    signo.temperatura = this.form.value['temperatura'];
    signo.pulso = this.form.value['pulso'];
    signo.ritmo = this.form.value['ritmo'];

    if (this.edicion) {
      //MODIFICAR
      //PRACTICA COMUN
      this.signoService.modificar(signo).subscribe(() => {
        this.signoService.listar().subscribe(data => {
          this.signoService.setSignoCambio(data);
          this.signoService.setMensajeCambio('SE MODIFICÓ');
        });
      });
    } else {
      //REGISTRAR
      //PRACTICA IDEAL
      this.signoService.registrar(signo).pipe(switchMap(() => {
        return this.signoService.listar();
      })).subscribe(data => {
        this.signoService.setSignoCambio(data);
        this.signoService.setMensajeCambio('SE REGISTRO');
      });
    }

    this.router.navigate(['pages/signo']);

  }

  initForm() {
    if (this.edicion) {
      this.signoService.listarPorId(this.id).subscribe(data => {
        this.form = new FormGroup({
          'id': new FormControl(data.idSigno),
          'paciente': new FormControl(data.paciente),
          'fecha': new FormControl(new Date(data.fecha)),
          'temperatura': new FormControl(data.temperatura),
          'pulso': new FormControl(data.pulso),
          'ritmo': new FormControl(data.ritmo)
        });
        this.fechaSeleccionada = new Date(data.fecha);
      });
    }
    else {
      this.fechaSeleccionada = new Date();
    }
  }
}

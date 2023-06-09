import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl:'app.component.html', 
  styles: []
})
export class AppComponent implements OnInit {
  @ViewChild('pokedex') pokedex;
  title = 'pokecatch';
  pokemonsDex = [];
  save = [];
  selecionado = 0;
  money = 0;

  get pokemon() 
  {
    return this.mapPokemon(this.selecionado);
  }
  get pokemonCollection() {
    
    return  {
      pokemons : this.mapPokemon(this.selecionado).filter(x => x.catch),
      index : this.selecionado,
      name : () => this.mapPokemon(this.selecionado)[0]?.name ?? '??????',
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    event.preventDefault();
    if (event.code === 'ArrowUp' && this.selecionado != 0 ) {
      this.selecionado--;
      this.pokedex.nativeElement.scrollTop -= 60;
    }

    if (event.code === 'ArrowDown' && this.selecionado != this.pokemonsDex.length - 1 ) {
      this.selecionado++;
      this.pokedex.nativeElement.scrollTop += 60;
    }
  }


  constructor(private readonly http : HttpClient,
              private readonly toastr : ToastrService,
              private readonly modalService : BsModalService) {}

  ngOnInit(): void {
    this.getAllPokemon();
  }

  getAllPokemon() {
    this.http.get('https://pokeapi.co/api/v2/pokemon/?limit=250').subscribe(x => {
      this.pokemonsDex = x['results'];
      console.log(this.pokemonsDex);
    });
  }

  getPokemons() {
    var number = Math.ceil(Math.random() * this.pokemonsDex.length);    
    var pokemon = this.pokemonsDex[number];
    console.log(number);
    
    return this.http.get('https://pokeapi.co/api/v2/pokemon/'+pokemon.name).subscribe(x => {
      var isShiny = Math.random() >= 0.9;
      var isCaught =Math.random() >= 0.5;
      this.save.push({
        index : x['id'] - 1,
        name : x['name'],
        types: x['types'].map(x => x.type.name),
        sprites : x['sprites'],
        catch : isCaught,
        shiny : isShiny,
        sprite : {
          front : isShiny ? x['sprites']['front_shiny']  : x['sprites']['front_default'],
          back : isShiny ? x['sprites']['back_shiny']  : x['sprites']['back_default'],
        }
      })
      this.toastr.info('Pokemon ' + x['name'] + ' capturado!');
    });
  }

  sell(pokemon, money){
    this.modalRef.hide();
    timer((Math.random() * 10) * 1000).subscribe(() => {
      this.toastr.success('Pokemon ' + pokemon.name + ' vendido!');
      this.money +=  money;
    });
  }
  buy(pokemon, money) {
    this.modalRef.hide();
    timer((Math.random() * 10) * 1000).subscribe(() => {
      this.toastr.success('Pokemon ' + pokemon.name + ' comprado!');
      this.money -=  money;

    });
  }
  mapPokemon(index) {
    return this.save.filter(x => x.index == index);
  }

  catched(index) {
    return this.mapPokemon(index).some(x => x.catch);
  }

  known(index) {
    return this.mapPokemon(index).length > 0;
  }

  getTypes(index) {
    return this.mapPokemon(index).sort((a)=> a.shiny ? -1 : 10)[0]?.types as string[];
  }

  getQuantidade(index){
    return this.mapPokemon(index).filter(x => x.catch).length;
  }

  getSprite(index) {
    return this.mapPokemon(index)[0]?.sprite?.front;
  }
  modalRef;
  pokemonSelecionado;
  showToSell(template, pokemonSelecionado) {
    this.pokemonSelecionado = pokemonSelecionado;
    this.modalRef = this.modalService.show(template);
  }
}

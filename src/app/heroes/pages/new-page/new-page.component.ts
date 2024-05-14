import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { __values } from 'tslib';
import { Publisher, Hero } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: ``
})
export class NewPageComponent implements OnInit{

  public heroForm = new FormGroup({
  id: new FormControl<string>(''),
  superhero: new FormControl<string>('', {nonNullable: true}),
  publisher: new FormControl<Publisher>(Publisher.DCComics),
  alter_ego: new FormControl<string>(''),
  first_appearance: new FormControl<string>(''),
  characters: new FormControl<string>(''),
  alt_img: new FormControl<string>('')
  });


  constructor (
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) {}


  ngOnInit(): void {

    if ( !this.router.url.includes('edit')  ) return;

    this.activatedRoute.params
      .pipe(
        switchMap( ({id }) => this.heroesService.getHeroById(id)),
      ).subscribe (hero => {
          if (!hero) {
            return this.router.navigateByUrl('/');
          }

          this.heroForm.reset(hero);
          return;

        })



  }

  get currentHero():Hero{
    const hero = this.heroForm.value as Hero;

    return hero;
  }

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics'},
    {  id: 'Marvel Comics', desc: 'Marvel - Comics'}
  ]

  onSubmit():void{
    if ( this.heroForm.invalid ) return;

    if ( this.currentHero.id ) {
      console.log('UPDATED !  ')
      this.heroesService.updateHero ( this.currentHero )

      .subscribe ( hero => {
        this.showSnackbar(`${hero.superhero} updated!`)
        // TODO SNACKBAR
      })

      return;
    }

    this.heroesService.addHero( this.currentHero )
      .subscribe ( hero => {
        // TODO NAVEGAR
        this.router.navigate(['/heroes/edit', hero.id])
        this.showSnackbar(`${hero.superhero} created!`)

      })

  }

  onDeleteHero():void{
    if (!this.currentHero.id) throw Error('Required ID')
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: this.heroForm.value,
      });

      dialogRef.afterClosed().subscribe(result => {
         if ( !result ) return;

         this.heroesService.deleteHeroById(this.currentHero.id)
         .subscribe(wasDeleted => {
          if (wasDeleted )

          this.router.navigateByUrl('/')

         })
      });
  }

  showSnackbar( message:string ):void{
    this.snackBar.open(message, 'Done', {
      duration: 2500,
    })
  }



}

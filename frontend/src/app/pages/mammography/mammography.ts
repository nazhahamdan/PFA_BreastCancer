import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MammographyResult, MammographyService } from '../../service/mammography.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mammography',
  imports: [CommonModule,RouterLink],
  templateUrl: './mammography.html',
  styleUrl: './mammography.css',
})
export class Mammography  implements OnInit{
    patientId = 1;

  // Upload
  imageSelectionnee: File | null = null;
  imagePreview: string | null = null;
  enChargement = false;

  // Résultat
  resultat: MammographyResult | null = null;

  // Historique
  historique: MammographyResult[] = [];
  afficherHistorique = false;

  constructor(private mammographyService: MammographyService) {}

  ngOnInit() {
    this.chargerHistorique();
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageSelectionnee = input.files[0];
      this.resultat = null;

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.imageSelectionnee);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.imageSelectionnee = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  analyser() {
    if (!this.imageSelectionnee) return;
    this.enChargement = true;
    this.resultat = null;

    this.mammographyService.analyser(this.patientId, this.imageSelectionnee)
      .subscribe({
        next: (res) => {
          this.resultat = res;
          this.enChargement = false;
          this.chargerHistorique();
        },
        error: () => {
          this.enChargement = false;
        }
      });
  }

  chargerHistorique() {
    this.mammographyService.getHistorique(this.patientId)
      .subscribe(data => this.historique = data);
  }

  reinitialiser() {
    this.imageSelectionnee = null;
    this.imagePreview = null;
    this.resultat = null;
  }

  getConfidencePct(): string {
    return this.resultat ? (this.resultat.confidence * 100).toFixed(1) + '%' : '0%';
  }

}

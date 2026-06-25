import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MammographyResult, MammographyService } from '../../service/mammography.service';
import { RouterLink } from '@angular/router';

export interface MammographyDTO {
  id: number;
  patientId: number;
  imageUrl: string;
  resultat: 'CANCER' | 'NORMAL'| 'BENIN';
  confidence: number;
  dateAnalyse: string;
  details: string;
  label?: string;
  probabilites?: {
    'Negative': number;
    'B. Calc': number;
    'B. Mass': number;
    'M. Calc': number;
    'M. Mass': number;
  };
  gradcamBase64?: string;  // ← champ Grad-CAM
}

@Component({
  selector: 'app-mammography',
  imports: [CommonModule, RouterLink],
  templateUrl: './mammography.html',
  styleUrl: './mammography.css',
})
export class Mammography implements OnInit {
  patientId = 1;

  // Upload
  imageSelectionnee: File | null = null;
  imagePreview: string | null = null;
  enChargement = false;

  // Résultat
  resultat: MammographyResult | null = null;
  gradcamUrl: string | null = null;  // ← AJOUT

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
      this.gradcamUrl = null;  // ← AJOUT : reset

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
      this.gradcamUrl = null;  // ← AJOUT : reset
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
    this.gradcamUrl = null;  // ← AJOUT : reset

    this.mammographyService.analyser(this.patientId, this.imageSelectionnee)
      .subscribe({
        next: (res) => {
          this.resultat = res;
          this.enChargement = false;
          this.chargerHistorique();

          // ← AJOUT : construire l'URL base64 pour affichage
          if ((res as any).gradcamBase64) {
            this.gradcamUrl = `data:image/png;base64,${(res as any).gradcamBase64}`;
          }
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
    this.gradcamUrl = null;  // ← AJOUT : reset
  }

  getClasses(): string[] {
    return ['Negative', 'B. Calc', 'B. Mass', 'M. Calc', 'M. Mass'];
  }

  getProbPct(classe: string): number {
    if (!this.resultat?.probabilites) return 0;
    return (this.resultat.probabilites[classe as keyof typeof this.resultat.probabilites] ?? 0) * 100;
  }

  isMalignant(classe: string): boolean {
    return classe === 'M. Calc' || classe === 'M. Mass';
  }
isBenin(classe: string): boolean {
  return classe === 'B. Calc' || classe === 'B. Mass';
}

isNegative(classe: string): boolean {
  return classe === 'Negative';
}

  getConfidencePct(): string {
    return `${((this.resultat?.confidence ?? 0) * 100).toFixed(1)}%`;
  }
}

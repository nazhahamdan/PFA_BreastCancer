import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendrierJourDTO, DiagnosticDTO, DiagnosticService } from '../../service/diagnostic.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],   // ← FormsModule ajouté
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  patientId = 1;
  currentYear  = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  joursCalendrier: CalendrierJourDTO[]       = [];
  jourSelectionne: CalendrierJourDTO | null  = null;
  diagnosticSelectionne: DiagnosticDTO | null = null;

  moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
               'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  joursGrid: (CalendrierJourDTO | null)[] = [];

  // ── Formulaire ──────────────────────────────────────────
  afficherFormulaire = false;
  enSauvegarde       = false;
  messageSucces      = '';

  nouveauDiagnostic: Partial<DiagnosticDTO> = {
    type          : 'DOCTOR_CONSULTATION',
    status        : 'BON',
    date          : new Date().toISOString().split('T')[0] as any,
    nomMedecin    : '',
    resultatMedecin: '',
    notesMedecin  : '',
    details       : '',
  };

  constructor(private diagnosticService: DiagnosticService) {}

  ngOnInit() { this.chargerCalendrier(); }

  // ── Calendrier ──────────────────────────────────────────
  chargerCalendrier() {
    this.diagnosticService.getCalendrier(this.patientId, this.currentYear, this.currentMonth)
      .subscribe(data => {
        this.joursCalendrier = data;
        this.construireGrille();
      });
  }

  construireGrille() {
    const date = new Date(this.currentYear, this.currentMonth - 1, 1);
    const premierJour = (date.getDay() + 6) % 7;
    const nombreJours = new Date(this.currentYear, this.currentMonth, 0).getDate();

    this.joursGrid = [];
    for (let i = 0; i < premierJour; i++) this.joursGrid.push(null);
    for (let jour = 1; jour <= nombreJours; jour++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2,'0')}-${String(jour).padStart(2,'0')}`;
      const jourData = this.joursCalendrier.find(j => j.date === dateStr) || null;
      this.joursGrid.push(jourData ?? { date: dateStr, couleur: 'NONE' as any, nombreDiagnostics: 0, diagnostics: [] });
    }
  }

  moisPrecedent() {
    if (this.currentMonth === 1) { this.currentMonth = 12; this.currentYear--; }
    else this.currentMonth--;
    this.jourSelectionne = null;
    this.chargerCalendrier();
  }

  moisSuivant() {
    if (this.currentMonth === 12) { this.currentMonth = 1; this.currentYear++; }
    else this.currentMonth++;
    this.jourSelectionne = null;
    this.chargerCalendrier();
  }

  selectionnerJour(jour: CalendrierJourDTO | null) {
    if (jour && jour.nombreDiagnostics > 0) {
      this.jourSelectionne = jour;
      this.diagnosticSelectionne = null;
    }
  }

  selectionnerDiagnostic(d: DiagnosticDTO) { this.diagnosticSelectionne = d; }

  // ── Formulaire ──────────────────────────────────────────
  ouvrirFormulaire() {
    this.afficherFormulaire = true;
    this.messageSucces      = '';
    this.nouveauDiagnostic  = {
      type           : 'DOCTOR_CONSULTATION',
      status         : 'BON',
      date           : new Date().toISOString().split('T')[0] as any,
      nomMedecin     : '',
      resultatMedecin: '',
      notesMedecin   : '',
      details        : '',
    };
  }

  fermerFormulaire() {
    this.afficherFormulaire = false;
    this.messageSucces      = '';
  }

  sauvegarderDiagnostic() {
    if (!this.nouveauDiagnostic.nomMedecin?.trim()) return;

    this.enSauvegarde = true;

    this.diagnosticService.ajouterDiagnostic(this.patientId, this.nouveauDiagnostic)
      .subscribe({
        next: () => {
          this.enSauvegarde      = false;
          this.messageSucces     = ' Consultation enregistrée avec succès !';
          this.chargerCalendrier();             // rafraîchir le calendrier
          setTimeout(() => this.fermerFormulaire(), 1500);
        },
        error: () => {
          this.enSauvegarde  = false;
          this.messageSucces = '❌ Erreur lors de l\'enregistrement.';
        }
      });
  }

  // ── Helpers ─────────────────────────────────────────────
  getCouleurClass(couleur: string): string {
    switch (couleur) {
      case 'BABY_PINK':   return 'jour-baby-pink';
      case 'MEDIUM_PINK': return 'jour-medium-pink';
      case 'PINK':        return 'jour-pink';
      case 'DARK_RED':    return 'jour-dark-red';
      default:            return 'jour-vide';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'SYMPTOM_DIAGNOSTIC':   return '🩺 Diagnostic symptômes';
      case 'MAMMOGRAPHY_ANALYSIS': return '🔬 Analyse mammographique';
      case 'DOCTOR_CONSULTATION':  return '👨‍⚕️ Consultation médecin';
      default: return type;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'BON':     return '🟢 Bon';
      case 'SUSPECT': return '⚠️ Suspect';
      case 'CANCER':  return '🔴 Cancer détecté';
      default: return status;
    }
  }

  get moisActuelNom(): string { return this.moisNoms[this.currentMonth - 1]; }
}
